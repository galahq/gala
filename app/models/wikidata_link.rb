# frozen_string_literal: true

# Represents a link to a Wikidata entity
#
# This model stores references to Wikidata entities (QIDs) along with
# cached data to avoid frequent API calls.
#
# @attr [String] qid Wikidata entity ID (e.g., 'Q937')
# @attr [String] schema The schema used for this link (e.g., 'case_study', 'researchers')
# @attr [ActiveRecord::Base] record The record this link belongs to (polymorphic)
# @attr [Integer] position The position of this link relative to other links on the same record
# @attr [Hash] cached_json Cached data from Wikidata to avoid frequent API calls
# @attr [DateTime] last_synced_at When this link was last synced with Wikidata
class WikidataLink < ApplicationRecord
  # Associations
  belongs_to :record, polymorphic: true, optional: true

  # Validations
  validates :qid, presence: true
  validates :schema, presence: true

  # Scopes
  scope :for_case, -> { where(record_type: 'Case') }
  scope :self_links, -> { where(record_type: 'self') }
  scope :stale, -> { where('last_synced_at < ?', 1.day.ago) }
  scope :real_entities, -> { where('qid LIKE ?', 'Q%') }
  scope :local_entities, -> { where('qid LIKE ?', 'GALA-%') }

  # Fetches fresh data from Wikidata and updates the cached_json
  #
  # @return [Boolean] true if the update was successful, false otherwise
  def fetch_and_update_data!
    Rails.logger.info "Fetching fresh data for Wikidata entity: #{qid} (schema: #{schema})"

    begin
      client = Wikidata::ApiClient.new
      entity_data = client.get_entity(qid)

      if entity_data.present?
        # Format the entity data for our cache
        update!(
          cached_json: format_entity_data(entity_data),
          last_synced_at: Time.current
        )
        Rails.logger.info "Successfully updated cached data for #{qid}"
        return true
      else
        Rails.logger.warn "No data returned for #{qid}"
        return false
      end
    rescue StandardError => e
      Rails.logger.error "Error fetching data for #{qid}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      return false
    end
  end

  # Returns the entity label from cached data
  #
  # @return [String, nil] The entity label or nil if not available
  def entity_label
    cached_json&.dig('entityLabel')
  end

  # Returns the entity properties from cached data
  #
  # @return [Array<Hash>, nil] Array of property hashes or nil if not available
  def properties
    cached_json&.dig('properties')
  end

  # Returns the JSON-LD representation from cached data
  #
  # @return [Hash, nil] The JSON-LD representation or nil if not available
  def json_ld
    cached_json&.dig('json_ld')
  end

  # Generates a URL to view this entity on Wikidata
  #
  # @return [String] URL to the entity on Wikidata
  def wikidata_url
    if real_wikidata_entity?
      "https://www.wikidata.org/wiki/#{qid}"
    else
      # For local entities, link to our application
      if record_type == 'Case' && record
        "#{base_url}/cases/#{record.slug}"
      elsif record_type == 'self' && record_id
        kase = Case.find_by(id: record_id)
        kase ? "#{base_url}/cases/#{kase.slug}" : nil
      else
        nil
      end
    end
  end

  # Returns true if this entity needs a refresh
  #
  # @return [Boolean] true if the entity data is stale
  def needs_refresh?
    last_synced_at.nil? || last_synced_at < 1.day.ago
  end

  # Returns true if this is a real Wikidata entity
  #
  # @return [Boolean] true if this is a real Wikidata entity (starts with 'Q')
  def real_wikidata_entity?
    qid.start_with?('Q') && !qid.include?('-')
  end

  # Find a link by schema for a given record
  #
  # @param record [ActiveRecord::Base] The record to find links for
  # @param schema [String] The schema to find
  # @return [WikidataLink, nil] The matching link or nil if not found
  def self.find_by_schema(record, schema)
    where(record: record, schema: schema).first
  end

  # Find a self link by record ID
  #
  # @param record_id [Integer] The ID of the record
  # @return [WikidataLink, nil] The matching self link or nil if not found
  def self.find_self_link(record_id)
    where(record_type: 'self', record_id: record_id).first
  end

  # Find all self links
  #
  # @return [ActiveRecord::Relation] Collection of self links
  def self.all_self_links
    where(record_type: 'self')
  end

  # Check if this is a self link
  #
  # @return [Boolean] true if this is a self link, false otherwise
  def self_link?
    record_type == 'self'
  end

  # Refresh all stale links
  #
  # @return [Integer] Number of links successfully refreshed
  def self.refresh_stale!
    count = 0
    stale.find_each do |link|
      count += 1 if link.fetch_and_update_data!
    end
    count
  end

  private

  # Format entity data for caching
  #
  # @param entity_data [Hash] Raw entity data from Wikidata API
  # @return [Hash] Formatted entity data for caching
  def format_entity_data(entity_data)
    locale = I18n.locale.to_s

    # Extract label in the current locale or English
    label = entity_data.dig('labels', locale, 'value') ||
            entity_data.dig('labels', 'en', 'value') ||
            "Entity #{qid}"

    # Extract properties
    properties = []
    if entity_data['claims'].present?
      entity_data['claims'].each do |property_id, statements|
        if statements.present? && statements.first.present?
          statement = statements.first
          if statement['mainsnak'] && statement['mainsnak']['datavalue']
            value = extract_value_from_datavalue(statement['mainsnak']['datavalue'])
            properties << { property_id => value }
          end
        end
      end
    end

    # Generate JSON-LD
    json_ld = generate_json_ld(entity_data, label)

    {
      'entityLabel' => label,
      'properties' => properties,
      'json_ld' => json_ld
    }
  end

  # Extract a value from a Wikidata datavalue
  #
  # @param datavalue [Hash] The datavalue from Wikidata
  # @return [String] The extracted value
  def extract_value_from_datavalue(datavalue)
    case datavalue['type']
    when 'wikibase-entityid'
      datavalue.dig('value', 'id')
    when 'time'
      datavalue.dig('value', 'time')
    when 'string'
      datavalue['value']
    when 'monolingualtext'
      datavalue.dig('value', 'text')
    else
      datavalue['value'].to_s
    end
  end

  # Generate JSON-LD representation of entity
  #
  # @param entity_data [Hash] Raw entity data from Wikidata
  # @param label [String] The entity label
  # @return [Hash] JSON-LD representation
  def generate_json_ld(entity_data, label)
    locale = I18n.locale.to_s

    # Create a basic JSON-LD structure
    {
      '@context' => 'https://schema.org',
      '@type' => schema_type_for_schema,
      '@id' => "https://www.wikidata.org/wiki/#{entity_data['id']}",
      'name' => label,
      'description' => entity_data.dig('descriptions', locale, 'value') ||
                       entity_data.dig('descriptions', 'en', 'value')
    }
  end

  # Map schema to Schema.org type
  #
  # @return [String] Schema.org type
  def schema_type_for_schema
    case schema
    when 'case_study'
      'CreativeWork'
    when 'researchers'
      'Person'
    when 'organizations'
      'Organization'
    when 'locations'
      'Place'
    else
      'Thing'
    end
  end

  # Get the base URL for the application
  #
  # @return [String] Base URL
  def base_url
    host = ENV['BASE_URL'].presence
    "https://#{host}"
  end
end
