# frozen_string_literal: true

module Wikidata
  class SyncService
    # Convert to static methods - remove instance attributes
    # attr_reader :kase, :locale

    # Main method to sync a case with Wikidata
    # @param kase [Case] The case to sync
    # @param locale [String] The language locale
    # @param client [Wikidata::Client] Optional client to use
    # @return [String] The Wikidata QID
    def self.sync!(kase, locale = 'en', client = nil)
      # If case doesn't have a Wikidata QID yet, create a new entity
      if existing_wikidata_link = find_existing_wikidata_link(kase)
        update_existing_entity(kase, locale, existing_wikidata_link, client)
      else
        create_new_entity(kase, locale, client)
      end
    end

    # Find existing Wikidata link for a case
    # @param kase [Case] The case to check
    # @return [WikidataLink, nil] The existing link or nil
    def self.find_existing_wikidata_link(kase)
      kase.wikidata_links.find_by(schema: 'case_study')
    end

    # Maps Case attributes to Wikidata properties according to GalaCaseStudy schema
    #
    # @param kase [Case] The case to convert
    # @param locale [String] The language locale
    # @return [Hash] Properties to set on the Wikidata entity
    def self.case_to_wikidata_properties(kase, locale)
      {
        'P31' => 'Q155207',                    # Instance of: case study
        'P1476' => { value: kase.title, type: :string }, # Title
        'P2093' => extract_author_names(kase).map { |name| { value: name, type: :string } }, # Author name strings
        'P407' => map_locale_to_language_qid(locale),  # Language of work
        'P953' => { value: case_url(kase), type: :string }, # Full work available at URL
        'P1433' => 'Q130549584',               # Published in: Gala
        'P577' => { value: format_datetime(kase.published_at), type: :time }, # Publication date
        'P5017' => { value: format_datetime(kase.updated_at), type: :time },  # Last update
        'P6216' => 'Q50423863',                # Copyright status: copyrighted
        'P275' => map_license_to_qid(kase)     # License
      }.compact
    end

    # Creates a new Wikidata entity for the case
    #
    # @param kase [Case] The case to create an entity for
    # @param locale [String] The language locale
    # @param client [Wikidata::Client] Optional client to use
    # @return [String] The newly created entity identifier
    def self.create_new_entity(kase, locale = 'en', client = nil)
      Rails.logger.info "Creating new Wikidata entity for case: #{kase.id}"

      # Use provided client or create a new one
      client ||= Wikidata::Client.new

      # Create the base entity with label and description
      description = "Case study on #{kase.dek}".truncate(250)
      qid = client.create_entity(kase.title, description)

      if qid.present?
        # Add claims (properties) to the entity
        client.add_claims(qid, case_to_wikidata_properties(kase, locale))

        # Fetch the complete entity data for caching
        entity_data = client.get_entity(qid)
        json_ld = client.generate_json_ld(entity_data)

        # Create the standard case link
        kase.wikidata_links.create!(
          qid: qid,
          schema: 'case_study',
          position: (kase.wikidata_links.maximum(:position) || 0) + 1,
          cached_json: {
            'entityLabel' => kase.title,
            'properties' => format_properties_for_cache(case_to_wikidata_properties(kase, locale)),
            'json_ld' => json_ld
          },
          last_synced_at: Time.current
        )

        # Create the "self" link to represent the entity itself
        WikidataLink.create!(
          qid: qid,
          schema: 'case_study',
          record_type: 'self',
          record_id: kase.id,
          position: 0,
          cached_json: {
            'entityLabel' => kase.title,
            'properties' => format_properties_for_cache(case_to_wikidata_properties(kase, locale)),
            'json_ld' => json_ld
          },
          last_synced_at: Time.current
        )

        Rails.logger.info "Created Wikidata entity with ID: #{qid}"
        return qid
      else
        error_message = "Failed to create Wikidata entity for case: #{kase.id}"
        Rails.logger.error error_message
        raise StandardError, error_message
      end
    end

    # Updates an existing Wikidata entity with current case data
    #
    # @param kase [Case] The case to update
    # @param locale [String] The language locale
    # @param existing_wikidata_link [WikidataLink] The existing link
    # @param client [Wikidata::Client] Optional client to use
    # @return [String] The ID of the updated entity
    def self.update_existing_entity(kase, locale = 'en', existing_wikidata_link = nil, client = nil)
      existing_wikidata_link ||= find_existing_wikidata_link(kase)
      qid = existing_wikidata_link.qid
      Rails.logger.info "Updating Wikidata entity #{qid} for case: #{kase.id}"

      # Use provided client or create a new one
      client ||= Wikidata::Client.new

      # Update the basic entity information (label and description)
      description = "Case study on #{kase.dek}".truncate(250)
      success = client.update_entity(qid, kase.title, description)

      # Update the claims (properties)
      if success
        # Remove existing claims for properties we want to update
        # This is simplified; in a real implementation you would compare and update only what changed
        # For now, we'll just update everything by adding the new claims
        properties = case_to_wikidata_properties(kase, locale)
        client.add_claims(qid, properties)

        # Fetch the updated entity data
        entity_data = client.get_entity(qid)
        json_ld = client.generate_json_ld(entity_data)

        # Update the cached information
        cache_data = {
          'entityLabel' => kase.title,
          'properties' => format_properties_for_cache(properties),
          'json_ld' => json_ld
        }

        # Update the standard case link
        existing_wikidata_link.update!(
          cached_json: cache_data,
          last_synced_at: Time.current
        )

        # Update or create the "self" link
        self_link = WikidataLink.find_or_initialize_by(
          qid: qid,
          record_type: 'self',
          record_id: kase.id
        )

        self_link.update!(
          schema: 'case_study',
          position: 0,
          cached_json: cache_data,
          last_synced_at: Time.current
        )

        Rails.logger.info "Updated Wikidata entity with ID: #{qid}"
        return qid
      else
        error_message = "Failed to update Wikidata entity #{qid} for case: #{kase.id}"
        Rails.logger.error error_message
        raise StandardError, error_message
      end
    end

    # Format properties for cache storage
    #
    # @param properties [Hash] Properties to format
    # @return [Array<Hash>] Formatted properties for cache
    def self.format_properties_for_cache(properties)
      properties.map do |property_id, value|
        if value.is_a?(Hash)
          { property_id => value[:value] }
        elsif value.is_a?(Array)
          { property_id => value.map { |v| v.is_a?(Hash) ? v[:value] : v } }
        else
          { property_id => value }
        end
      end
    end

    # Extract author names from the case
    #
    # @param kase [Case] The case to extract authors from
    # @return [Array<String>] List of author names
    def self.extract_author_names(kase)
      kase.authors.map { |author| author['name'] }
    end

    # Map ISO language code to Wikidata QID
    #
    # @param locale [String] ISO language code
    # @return [String] Wikidata QID for the language
    def self.map_locale_to_language_qid(locale)
      # Map ISO language code to Wikidata QID
      language_qid_map = {
        'en' => 'Q1860',   # English
        'es' => 'Q1321',   # Spanish
        'fr' => 'Q150',    # French
        'de' => 'Q188',    # German
        'it' => 'Q652',    # Italian
        'pt' => 'Q5146',   # Portuguese
        'ru' => 'Q7737',   # Russian
        'zh' => 'Q7850',   # Chinese
        'ja' => 'Q5287',   # Japanese
        'ar' => 'Q13955',  # Arabic
        # Additional languages...
      }

      language_qid_map[locale] || 'Q1860' # Default to English if no mapping found
    end

    # Map license identifier to Wikidata QID
    #
    # @param kase [Case] The case to get license from
    # @return [String] Wikidata QID for the license
    def self.map_license_to_qid(kase)
      # Map license to Wikidata QID
      license_qid_map = {
        'all_rights_reserved' => 'Q27935507', # All Rights Reserved (copyright)
        'cc_by_nc' => 'Q24082749',           # CC BY-NC 4.0
        'cc_by_nc_nd' => 'Q24082750'         # CC BY-NC-ND 4.0
      }

      license_qid_map[kase.license] || 'Q27935507'
    end

    # Generate the URL where the case can be accessed
    #
    # @param kase [Case] The case to generate URL for
    # @return [String] Full URL to the case
    def self.case_url(kase)
      # Set a default host if the environment variable is not set
      host = ENV['BASE_URL'].presence

      # Generate the URL where the case can be accessed
      if Rails.env.test? || Rails.env.development?
        # For tests and development, return a dummy URL to avoid host issues
        "https://#{host}/cases/#{kase.slug}"
      else
        begin
          Rails.application.routes.url_helpers.case_url(kase, host: host)
        rescue ArgumentError => e
          # If URL generation fails, fall back to a manually constructed URL
          Rails.logger.warn "Error generating case URL: #{e.message}. Using fallback URL."
          "https://#{host}/cases/#{kase.slug}"
        end
      end
    end

    # Format a datetime for Wikidata (ISO 8601)
    #
    # @param datetime [DateTime, nil] The datetime to format
    # @return [String, nil] ISO 8601 formatted datetime or nil
    def self.format_datetime(datetime)
      datetime&.iso8601
    end
  end
end
