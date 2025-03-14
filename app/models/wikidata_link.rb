# frozen_string_literal: true

# Represents a link between a record in the application and an entity in Wikidata
#
# @attr qid [String] Wikidata entity identifier (e.g., "Q937")
# @attr schema [String] Type of entity in Wikidata (e.g., "researchers", "software")
# @attr record [ApplicationRecord] The record this link belongs to
# @attr position [Integer] Position when multiple links exist for a record
# @attr cached_json [Hash] Cached data from Wikidata
# @attr last_synced_at [DateTime] When the data was last synced with Wikidata
class WikidataLink < ApplicationRecord
  belongs_to :record, polymorphic: true

  validates :qid, presence: true, format: { with: /\AQ\d+\z/ }
  validates :schema, presence: true
  validates :position, presence: true, numericality: { only_integer: true }

  # Fetch fresh data from Wikidata and update the cached_json
  #
  # @return [Boolean] true if the data was successfully updated
  def fetch_and_update_data!
    return false if qid.blank? || schema.blank?

    client = Wikidata::Client.new
    data = client.fetch(schema.to_sym, qid)

    return false if data.nil?

    update!(
      cached_json: data,
      last_synced_at: Time.current
    )

    true
  end

  # Get the label for this entity
  #
  # @return [String, nil] The entity label or nil if not available
  def label
    cached_json&.dig('entityLabel')
  end

  # Get the properties for this entity
  #
  # @return [Array<Hash>, nil] The entity properties or nil if not available
  def properties
    cached_json&.dig('properties') || []
  end

  # Get the JSON-LD representation of this entity
  #
  # @return [Hash, nil] JSON-LD data or nil if not available
  def json_ld
    cached_json&.dig('json_ld')
  end

  # Find a link by schema for the given record
  #
  # @param record [ApplicationRecord] The record to find links for
  # @param schema [String] The schema type to find
  # @return [WikidataLink, nil] The link with the given schema or nil
  def self.find_by_schema(record, schema)
    where(record: record, schema: schema).first
  end
end
