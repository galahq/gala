# frozen_string_literal: true

# An external resource linked to a case — a publication, event, grant, etc. —
# identified by one or more URLs, DOIs, or Wikidata QIDs. Modeled on DataCite’s
# RelatedItem (a name, typed identifiers, and a relation) and published on the
# case page as schema.org JSON-LD.
#
# @attr name [String]
# @attr identifiers [Array<{type: 'url'|'doi'|'wikidata', value: String}>]
# @attr connection [String] one of {CONNECTIONS}
# @attr connection_other [String] the author’s label when connection is “other”
# @attr description [String] optional detail on how the resource relates
# @attr position [Integer]
class LinkedResource < ApplicationRecord
  CONNECTIONS = %w[publication event grant implementation other].freeze
  IDENTIFIER_TYPES = %w[url doi wikidata].freeze

  IDENTIFIER_FORMATS = {
    # A scheme and a dotted host name, e.g. https://example.org/page
    'url' => %r{\Ahttps?://[^\s/.]+(\.[^\s/.]+)+(/\S*)?\z}i,
    'doi' => %r{\A10\.\d{4,9}/\S+\z},
    'wikidata' => /\AQ\d+\z/
  }.freeze

  belongs_to :record, polymorphic: true, inverse_of: :linked_resources

  before_validation :normalize_identifiers

  validates :name, presence: true
  validates :connection, inclusion: { in: CONNECTIONS }
  validates :connection_other, presence: true, if: -> { connection == 'other' }
  validate :identifiers_are_valid

  def self.href_for(identifier)
    value = identifier['value']
    case identifier['type']
    when 'doi' then "https://doi.org/#{value}"
    when 'wikidata' then "https://www.wikidata.org/wiki/#{value}"
    else value
    end
  end

  def connection_label
    return connection_other if connection == 'other'

    I18n.t "catalog.linked_resources.connections.#{connection}"
  end

  # The schema.org property that relates the case to this resource
  def json_ld_property
    case connection
    when 'grant' then :funding
    when 'publication' then :citation
    else :mentions
    end
  end

  def json_ld
    {
      '@type': json_ld_type,
      name: name,
      description: [connection_label, description].compact_blank.join(': '),
      identifier: identifiers.map do |identifier|
        { '@type': 'PropertyValue', propertyID: identifier['type'],
          value: identifier['value'] }
      end,
      sameAs: identifiers.map { |identifier| self.class.href_for identifier }
    }
  end

  private

  def json_ld_type
    case connection
    when 'grant' then 'Grant'
    when 'publication' then 'CreativeWork'
    when 'event' then 'Event'
    else 'Thing'
    end
  end

  def normalize_identifiers
    self.identifiers = Array(identifiers).filter_map do |identifier|
      identifier = identifier.to_h.stringify_keys.slice('type', 'value')
      value = identifier['value'].to_s.strip
      next if value.blank?

      identifier.merge('value' => normalize_value(identifier['type'], value))
    end
  end

  def normalize_value(type, value)
    case type
    when 'url'
      # Assume https:// for bare addresses like “example.org/page”
      return value if value.match?(%r{\A[a-z][a-z\d+.-]*://}i)

      "https://#{value.delete_prefix('//')}"
    when 'doi'
      value.sub(%r{\A(https?://(dx\.)?doi\.org/|doi:)}i, '')
    when 'wikidata'
      value.sub(%r{\Ahttps?://(www\.)?wikidata\.org/(wiki|entity)/}i, '').upcase
    else value
    end
  end

  def identifiers_are_valid
    if identifiers.empty?
      errors.add :identifiers, :blank
      return
    end

    identifiers.each do |identifier|
      format = IDENTIFIER_FORMATS[identifier['type']]
      next if format&.match?(identifier['value'])

      errors.add :identifiers, :invalid, message:
        "include an invalid #{identifier['type']}: #{identifier['value']}"
    end
  end
end
