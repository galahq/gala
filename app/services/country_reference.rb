# frozen_string_literal: true

require 'json'

# Resolves country values (ISO2, ISO3, and names) against configured reference data.
class CountryReference
  UNKNOWN_COUNTRY = { iso2: nil, iso3: nil, name: 'Unknown' }.freeze

  NAME_ALIASES_TO_ISO2 = {
    'uk' => 'GB',
    'united kingdom' => 'GB',
    'england' => 'GB',
    'scotland' => 'GB',
    'wales' => 'GB',
    'great britain' => 'GB',
    'usa' => 'US',
    'us' => 'US',
    'u s a' => 'US',
    'u s' => 'US',
    'united states' => 'US',
    'united states of america' => 'US'
  }.freeze

  NORMALIZE_NAME = lambda do |value|
    s = value.to_s.strip
    next nil if s.empty?

    normalized = s.unicode_normalize(:nfkd)
                  .encode('ASCII', invalid: :replace, undef: :replace, replace: '')
                  .downcase
                  .gsub(/[^a-z0-9]+/, ' ')
                  .squeeze(' ')
                  .strip

    normalized.empty? ? nil : normalized
  end.freeze

  raw_data = begin
    country_reference_data
  rescue StandardError
    path = Rails.root.join('config/country_reference.json')
    JSON.parse(File.read(path))
  end

  COUNTRY_DATA = raw_data.each_with_object({}) do |(iso2, country), acc|
    iso2_key = iso2.to_s.strip.upcase
    next if iso2_key.empty? || !country.is_a?(Hash)

    iso3 = (country['iso3'] || country[:iso3]).to_s.strip.upcase
    name = (country['name'] || country[:name]).to_s.strip
    next if iso3.empty? || name.empty?

    acc[iso2_key] = { iso3: iso3, name: name }.freeze
  end.freeze

  ISO2_TO_ISO3 = COUNTRY_DATA.transform_values { |country| country[:iso3] }.freeze
  ISO3_TO_ISO2 = ISO2_TO_ISO3.invert.freeze

  NAME_TO_ISO2 = COUNTRY_DATA.each_with_object({}) do |(iso2, country), h|
    key = NORMALIZE_NAME.call(country[:name])
    h[key] = iso2 if key
  end.merge(NAME_ALIASES_TO_ISO2).freeze

  def self.normalize_name(value)
    NORMALIZE_NAME.call(value)
  end

  def self.resolve(value)
    raw = value.to_s.strip
    return UNKNOWN_COUNTRY if unknown?(raw)

    iso2, iso3 = resolve_codes(raw)
    return { iso2: nil, iso3: nil, name: raw } unless iso2

    build_result(iso2, iso3)
  end

  def self.unknown?(value)
    s = value.to_s.strip
    s.empty? || s.casecmp('unknown').zero?
  end

  def self.resolve_codes(raw)
    up = raw.upcase
    return from_iso2(up) if COUNTRY_DATA.key?(up)
    return from_iso3(up) if ISO3_TO_ISO2.key?(up)

    from_name(raw)
  end

  def self.from_iso2(iso2)
    [iso2, COUNTRY_DATA.fetch(iso2)[:iso3]]
  end

  def self.from_iso3(iso3)
    iso2 = ISO3_TO_ISO2.fetch(iso3)
    [iso2, iso3]
  end

  def self.from_name(raw)
    key = normalize_name(raw)
    return [nil, nil] unless key

    iso2 = NAME_TO_ISO2[key]
    return [nil, nil] unless iso2

    [iso2, COUNTRY_DATA.fetch(iso2)[:iso3]]
  end

  def self.build_result(iso2, iso3)
    name = COUNTRY_DATA.fetch(iso2)[:name]
    { iso2: iso2, iso3: iso3, name: name }
  end

  private_class_method :resolve_codes, :from_iso2, :from_iso3, :from_name, :build_result
end
