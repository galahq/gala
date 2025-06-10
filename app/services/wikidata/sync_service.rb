# frozen_string_literal: true

module Wikidata
  class SyncService
    # Convert to static methods - remove instance attributes
    # attr_reader :kase, :locale

    # Main method to sync a case with Wikidata
    # @param kase [Case] The case to sync
    # @param locale [String] The language locale
    # @param client [Wikidata::Client] Optional client to use (deprecated)
    # @param dry_run [Boolean] If true, only logs what would be done without making changes
    # @return [String] The Wikidata QID
    def self.sync!(kase, locale = 'en', client = nil, dry_run: false)
      if dry_run
        # Show comprehensive dry run summary
        generate_dry_run_summary(kase, locale)
      end

      # If case doesn't have a Wikidata QID yet, create a new entity
      if existing_wikidata_link = find_existing_wikidata_link(kase)
        update_existing_entity(kase, locale, existing_wikidata_link, client, dry_run: dry_run)
      else
        create_new_entity(kase, locale, client, dry_run: dry_run)
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
      properties = {
        'P31' => 'Q155207', # Instance of: case study
        'P1476' => { value: kase.title, type: :string }, # Title
        'P407' => map_locale_to_language_qid(locale), # Language of work or name
        'P953' => { value: case_url(kase), type: :string }, # Full work available at URL (work available at URL)
        'P1433' => 'Q130549584',               # Published in: Gala
        'P6216' => 'Q50423863',                # Copyright status: copyrighted
        'P275' => map_license_to_qid(kase)     # Copyright license
      }

      # Add author name strings (P2093) if authors exist
      author_names = extract_author_names(kase)
      properties['P2093'] = author_names.map { |name| { value: name, type: :string } } if author_names.any?

      # Add publication date (P577) if published
      properties['P577'] = { value: format_datetime(kase.published_at), type: :time } if kase.published_at.present?

      # Add last update date (P5017) if available
      properties['P5017'] = { value: format_datetime(kase.updated_at), type: :time } if kase.updated_at.present?

      # Add main subject (P921) if we can derive it from content
      if kase.dek.present?
        # For now, we'll skip automatic subject detection
        # In the future, this could use NLP or manual tagging
      end

      properties.compact
    end

    # Creates a new Wikidata entity for the case
    #
    # @param kase [Case] The case to create an entity for
    # @param locale [String] The language locale
    # @param client [Wikidata::Client] Optional client to use (unused in new implementation)
    # @param dry_run [Boolean] If true, only logs what would be done without making changes
    # @return [String] The newly created entity identifier
    def self.create_new_entity(kase, locale = 'en', client = nil, dry_run: false)
      if dry_run
        Rails.logger.info "DRY RUN: Creating new Wikidata entity for case: #{kase.id} (#{kase.title})"
      else
        Rails.logger.info "Creating new Wikidata entity for case: #{kase.id} (#{kase.title})"
      end

      # Create the base entity with label and description
      description = 'Gala case study'
      description = "Case study on #{kase.dek}".truncate(250) if kase.dek.present?

      qid = Wikidata.create_entity(kase.title, description, locale, dry_run: dry_run)

      if qid.present?
        if dry_run
          Rails.logger.info "DRY RUN: Would create Wikidata entity QID: #{qid} for case: #{kase.id}"
        else
          Rails.logger.info "Created Wikidata entity QID: #{qid} for case: #{kase.id}"
        end

        # Add claims (properties) to the entity
        properties = case_to_wikidata_properties(kase, locale)
        success = Wikidata.add_claims(qid, properties, dry_run: dry_run)

        if success
          if dry_run
            Rails.logger.info "DRY RUN: Would create WikidataLink for case: #{kase.id} with QID: #{qid}"
            Rails.logger.info "DRY RUN: Would set schema: 'case_study'"
            Rails.logger.info "DRY RUN: Would cache #{properties.keys.size} properties"
          else
            # Fetch the complete entity data for caching
            entity_data = Wikidata.get_entity(qid, locale)
            json_ld = Wikidata.generate_json_ld(entity_data, locale)

            cache_data = {
              'entityLabel' => kase.title,
              'properties' => format_properties_for_cache(properties),
              'json_ld' => json_ld
            }

            # Create the standard case link
            wikidata_link = kase.wikidata_links.create!(
              qid: qid,
              schema: 'case_study',
              position: (kase.wikidata_links.maximum(:position) || 0) + 1,
              cached_json: cache_data,
              last_synced_at: Time.current
            )
          end

          if dry_run
            Rails.logger.info "DRY RUN: Would successfully create and configure Wikidata entity QID: #{qid} for case: #{kase.id}"
          else
            Rails.logger.info "Successfully created and configured Wikidata entity QID: #{qid} for case: #{kase.id}"
          end
          qid
        else
          error_message = "Failed to add properties to Wikidata entity QID: #{qid} for case: #{kase.id}"
          Rails.logger.error error_message
          raise StandardError, error_message unless dry_run

          qid
        end
      else
        error_message = "Failed to create Wikidata entity for case: #{kase.id} (#{kase.title})"
        Rails.logger.error error_message
        raise StandardError, error_message unless dry_run

        nil
      end
    end

    # Updates an existing Wikidata entity with current case data
    #
    # @param kase [Case] The case to update
    # @param locale [String] The language locale
    # @param existing_wikidata_link [WikidataLink] The existing link
    # @param client [Wikidata::Client] Optional client to use (unused in new implementation)
    # @param dry_run [Boolean] If true, only logs what would be done without making changes
    # @return [String] The ID of the updated entity
    def self.update_existing_entity(kase, locale = 'en', existing_wikidata_link = nil, client = nil, dry_run: false)
      existing_wikidata_link ||= find_existing_wikidata_link(kase)
      qid = existing_wikidata_link.qid

      if dry_run
        Rails.logger.info "DRY RUN: Updating Wikidata entity QID: #{qid} for case: #{kase.id} (#{kase.title})"
      else
        Rails.logger.info "Updating Wikidata entity QID: #{qid} for case: #{kase.id} (#{kase.title})"
      end

      # Update the basic entity information (label and description)
      description = 'Gala case study'
      description = "Case study on #{kase.dek}".truncate(250) if kase.dek.present?

      success = Wikidata.update_entity(qid, kase.title, description, locale, dry_run: dry_run)

      # Update the claims (properties)
      if success
        # For now, we'll add new claims rather than trying to update existing ones
        # In a production system, you'd want to compare and update only what changed
        properties = case_to_wikidata_properties(kase, locale)
        claims_success = Wikidata.add_claims(qid, properties, dry_run: dry_run)

        if claims_success
          if dry_run
            Rails.logger.info "DRY RUN: Would update WikidataLink cache for case: #{kase.id} with QID: #{qid}"
            Rails.logger.info "DRY RUN: Would update cached entity label to: '#{kase.title}'"
            Rails.logger.info "DRY RUN: Would update #{properties.keys.size} cached properties"
          else
            # Fetch the updated entity data
            entity_data = Wikidata.get_entity(qid, locale)
            json_ld = Wikidata.generate_json_ld(entity_data, locale)

            # Update the cached information
            cache_data = {
              'entityLabel' => kase.title,
              'properties' => format_properties_for_cache(properties),
              'json_ld' => json_ld
            }

            # Update the existing link
            existing_wikidata_link.update!(
              cached_json: cache_data,
              last_synced_at: Time.current
            )
          end

          if dry_run
            Rails.logger.info "DRY RUN: Would successfully update Wikidata entity QID: #{qid} for case: #{kase.id}"
          else
            Rails.logger.info "Successfully updated Wikidata entity QID: #{qid} for case: #{kase.id}"
          end
          qid
        else
          error_message = "Failed to update properties for Wikidata entity QID: #{qid} for case: #{kase.id}"
          Rails.logger.error error_message
          raise StandardError, error_message unless dry_run

          qid
        end
      else
        error_message = "Failed to update Wikidata entity QID: #{qid} for case: #{kase.id} (#{kase.title})"
        Rails.logger.error error_message
        raise StandardError, error_message unless dry_run

        qid
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
        'ar' => 'Q13955' # Arabic
        # Additional languages...
      }

      language_qid_map[locale] || 'Q1860' # Default to English if no mapping found
    end

    # Map license identifier to Wikidata QID
    #
    # @param kase [Case] The case to get license from
    # @return [String] Wikidata QID for the license
    def self.map_license_to_qid(kase)
      # Map license to Wikidata QID based on the examples provided
      license_qid_map = {
        'all_rights_reserved' => 'Q50423863',    # Copyrighted (matches examples)
        'cc_by' => 'Q20007257',                  # CC BY 4.0
        'cc_by_sa' => 'Q18199165',               # CC BY-SA 4.0
        'cc_by_nc' => 'Q24082749',               # CC BY-NC 4.0
        'cc_by_nc_nd' => 'Q24082750',            # CC BY-NC-ND 4.0
        'cc_by_nc_sa' => 'Q24082753'             # CC BY-NC-SA 4.0
      }

      # From the examples, it looks like Gala cases use CC BY 4.0
      license_qid_map[kase.license] || 'Q20007257' # Default to CC BY 4.0
    end

    # Generate the URL where the case can be accessed
    #
    # @param kase [Case] The case to generate URL for
    # @return [String] Full URL to the case
    def self.case_url(kase)
      # Use learngala.com domain as shown in the examples
      host = ENV['BASE_URL'].presence || 'www.learngala.com'

      # Generate the URL where the case can be accessed
      if Rails.env.test? || Rails.env.development?
        # For tests and development, return a URL matching the examples
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

    # Generate a comprehensive dry run summary showing all data that would be posted to Wikidata
    #
    # @param kase [Case] The case to analyze
    # @param locale [String] The language locale
    def self.generate_dry_run_summary(kase, locale)
      Rails.logger.info '=' * 80
      Rails.logger.info "DRY RUN SUMMARY: Wikidata Sync for Case #{kase.id}"
      Rails.logger.info '=' * 80

      # Basic case information
      Rails.logger.info 'CASE INFORMATION:'
      Rails.logger.info "  ID: #{kase.id}"
      Rails.logger.info "  Title: #{kase.title}"
      Rails.logger.info "  Slug: #{kase.slug}"
      Rails.logger.info "  Locale: #{locale}"
      Rails.logger.info "  Published: #{kase.published? ? 'Yes' : 'No'}"
      Rails.logger.info "  Published At: #{kase.published_at}"
      Rails.logger.info "  Updated At: #{kase.updated_at}"
      Rails.logger.info "  Description (dek): #{kase.dek.present? ? kase.dek.truncate(100) : 'None'}"

      # Check for existing Wikidata link
      existing_link = find_existing_wikidata_link(kase)
      if existing_link
        Rails.logger.info "  Existing QID: #{existing_link.qid}"
        Rails.logger.info "  Last Synced: #{existing_link.last_synced_at}"
        Rails.logger.info '  Operation: UPDATE existing entity'
      else
        Rails.logger.info '  Existing QID: None'
        Rails.logger.info '  Operation: CREATE new entity'
      end

      # Authors information
      Rails.logger.info "\nAUTHORS:"
      author_names = extract_author_names(kase)
      if author_names.any?
        author_names.each_with_index do |author, index|
          Rails.logger.info "  #{index + 1}. #{author}"
        end
      else
        Rails.logger.info '  None'
      end

      # Entity data that would be created/updated
      Rails.logger.info "\nWIKIDATA ENTITY DATA:"
      description = 'Gala case study'
      description = "Case study on #{kase.dek}".truncate(250) if kase.dek.present?

      Rails.logger.info "  Label (#{locale}): #{kase.title}"
      Rails.logger.info "  Description (#{locale}): #{description}"

      # Properties that would be added
      Rails.logger.info "\nPROPERTIES TO BE ADDED/UPDATED:"
      properties = case_to_wikidata_properties(kase, locale)

      properties.each do |property_id, value|
        property_name = get_property_name(property_id)
        if value.is_a?(Hash)
          display_value = value[:value]
          value_type = value[:type]
          Rails.logger.info "  #{property_id} (#{property_name}): #{display_value} [#{value_type}]"
        elsif value.is_a?(Array)
          Rails.logger.info "  #{property_id} (#{property_name}): [#{value.size} values]"
          value.each_with_index do |v, index|
            if v.is_a?(Hash)
              Rails.logger.info "    #{index + 1}. #{v[:value]} [#{v[:type]}]"
            else
              Rails.logger.info "    #{index + 1}. #{v}"
            end
          end
        else
          Rails.logger.info "  #{property_id} (#{property_name}): #{value}"
        end
      end

      # URL that would be generated
      Rails.logger.info "\nGENERATED URLS:"
      Rails.logger.info "  Case URL: #{case_url(kase)}"

      # License information
      Rails.logger.info "\nLICENSE INFORMATION:"
      license_qid = map_license_to_qid(kase)
      Rails.logger.info "  License QID: #{license_qid}"
      Rails.logger.info "  License Type: #{get_license_name(license_qid)}"

      # Language mapping
      Rails.logger.info "\nLANGUAGE MAPPING:"
      language_qid = map_locale_to_language_qid(locale)
      Rails.logger.info "  Locale: #{locale}"
      Rails.logger.info "  Language QID: #{language_qid}"

      Rails.logger.info "\n" + '=' * 80
      Rails.logger.info 'END DRY RUN SUMMARY'
      Rails.logger.info '=' * 80
    end

    # Get human-readable property names
    #
    # @param property_id [String] The property ID (e.g., 'P31')
    # @return [String] Human-readable property name
    def self.get_property_name(property_id)
      property_names = {
        'P31' => 'Instance of',
        'P1476' => 'Title',
        'P2093' => 'Author name string',
        'P407' => 'Language of work or name',
        'P953' => 'Full work available at URL',
        'P1433' => 'Published in',
        'P577' => 'Publication date',
        'P5017' => 'Last update',
        'P6216' => 'Copyright status',
        'P275' => 'Copyright license',
        'P921' => 'Main subject'
      }

      property_names[property_id] || property_id
    end

    # Get human-readable license names
    #
    # @param license_qid [String] The license QID
    # @return [String] Human-readable license name
    def self.get_license_name(license_qid)
      license_names = {
        'Q20007257' => 'Creative Commons Attribution 4.0 International',
        'Q18199165' => 'Creative Commons Attribution-ShareAlike 4.0 International',
        'Q18810341' => 'Creative Commons Attribution-NonCommercial 4.0 International',
        'Q24082749' => 'Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International'
      }

      license_names[license_qid] || "Unknown license (#{license_qid})"
    end
  end
end
