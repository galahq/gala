# frozen_string_literal: true

require 'json'
require 'singleton'

# Loads and resolves country names to ISO2/ISO3 codes.
class CountryReference
  include Singleton
  DATA_PATH = Rails.root.join('config/country_reference.json').freeze
  UNKNOWN_COUNTRY = { iso2: nil, iso3: nil, name: 'Unknown' }.freeze
  UNKNOWN_LABEL = 'unknown'
  NAME_ALIASES_TO_ISO2 = {
    'uk' => 'GB', 'united kingdom' => 'GB', 'england' => 'GB', 'scotland' => 'GB',
    'wales' => 'GB', 'great britain' => 'GB', 'usa' => 'US', 'us' => 'US',
    'u s a' => 'US', 'u s' => 'US', 'united states' => 'US',
    'united states of america' => 'US'
  }.freeze

  cattr_accessor :reference_data, instance_accessor: false, default: nil
  def self.load!
    self.reference_data = build_reference_data
  end

  def self.resolve(value)
    raw = normalize_label(value)
    return UNKNOWN_COUNTRY if unknown?(raw)

    data = reference_data || load!
    iso2 = resolve_iso2(raw, data)
    return { iso2: nil, iso3: nil, name: raw } unless iso2

    country = data[:countries][iso2]
    { iso2: iso2, iso3: country[:iso3], name: country[:name] }
  end

  def self.unknown?(value)
    normalized = normalize_name(value)
    normalized.nil? || normalized == UNKNOWN_LABEL
  end

  def self.build_reference_data
    countries = {}
    iso3_to_iso2 = {}
    name_to_iso2 = {}
    JSON.parse(File.read(DATA_PATH)).each do |iso2, country|
      next unless country.is_a?(Hash)

      iso2_code = normalize_code(iso2)
      iso3_code = normalize_code(country['iso3'] || country[:iso3])
      name = normalize_label(country['name'] || country[:name])
      next unless iso2_code && iso3_code && name

      countries[iso2_code] = { iso3: iso3_code, name: name }.freeze
      iso3_to_iso2[iso3_code] = iso2_code
      name_key = normalize_name(name)
      name_to_iso2[name_key] = iso2_code if name_key
    end
    NAME_ALIASES_TO_ISO2.each do |name, iso2|
      name_key = normalize_name(name)
      iso2_code = normalize_code(iso2)
      name_to_iso2[name_key] = iso2_code if name_key && iso2_code
    end
    {
      countries: countries.freeze,
      iso3_to_iso2: iso3_to_iso2.freeze,
      name_to_iso2: name_to_iso2.freeze
    }.freeze
  end

  def self.resolve_iso2(raw, data)
    code = normalize_code(raw)
    return code if code && data[:countries].key?(code)
    return data[:iso3_to_iso2][code] if code && data[:iso3_to_iso2].key?(code)

    data[:name_to_iso2][normalize_name(raw)]
  end

  def self.normalize_name(value)
    label = normalize_label(value)
    return nil unless label

    ascii = label.unicode_normalize(:nfkd).encode('ASCII', invalid: :replace, undef: :replace, replace: '')
                 .downcase.gsub(/[^a-z0-9]+/, ' ').squeeze(' ').strip
    ascii.empty? ? nil : ascii
  end

  def self.normalize_code(value)
    code = normalize_label(value)&.upcase
    code && !code.empty? ? code : nil
  end

  def self.normalize_label(value)
    label = value.to_s.strip
    label.empty? ? nil : label
  end

  private_class_method :build_reference_data, :resolve_iso2, :normalize_name,
                       :normalize_code, :normalize_label
end
