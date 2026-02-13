# frozen_string_literal: true

require 'json'

# Resolves country values (ISO2, ISO3, and names) against configured reference data.
class CountryReference # rubocop:disable Metrics/ClassLength
  DATA_PATH = Rails.root.join('config/country_reference.json').freeze
  CACHE_MUTEX = Mutex.new

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

  NORMALIZE_NAME = ->(value) do
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

  def self.load_reference_data
    JSON.parse(File.read(DATA_PATH))
  end

  def self.build_country_data(raw_data) # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity
    raw_data.each_with_object({}) do |(iso2, country), acc|
      iso2_key = iso2.to_s.strip.upcase
      next if iso2_key.empty? || !country.is_a?(Hash)

      iso3 = (country['iso3'] || country[:iso3]).to_s.strip.upcase
      name = (country['name'] || country[:name]).to_s.strip
      next if iso3.empty? || name.empty?

      acc[iso2_key] = { iso3: iso3, name: name }.freeze
    end.freeze
  end

  def self.build_name_to_iso2(country_data)
    country_data.each_with_object({}) do |(iso2, country), acc|
      key = NORMALIZE_NAME.call(country[:name])
      acc[key] = iso2 if key
    end.merge(NAME_ALIASES_TO_ISO2).freeze
  end

  def self.build_reference_cache(raw_data)
    country_data = build_country_data(raw_data)
    iso2_to_iso3 = country_data.transform_values { |country| country[:iso3] }.freeze

    {
      country_data: country_data,
      iso2_to_iso3: iso2_to_iso3,
      iso3_to_iso2: iso2_to_iso3.invert.freeze,
      name_to_iso2: build_name_to_iso2(country_data)
    }.freeze
  end

  def self.reference_cache
    return @reference_cache if @reference_cache

    CACHE_MUTEX.synchronize do
      @reference_cache ||= build_reference_cache(load_reference_data)
    end
  end

  def self.country_data
    reference_cache[:country_data]
  end

  def self.iso3_to_iso2
    reference_cache[:iso3_to_iso2]
  end

  def self.name_to_iso2
    reference_cache[:name_to_iso2]
  end

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
    return from_iso2(up) if country_data.key?(up)
    return from_iso3(up) if iso3_to_iso2.key?(up)

    from_name(raw)
  end

  def self.from_iso2(iso2)
    [iso2, country_data.fetch(iso2)[:iso3]]
  end

  def self.from_iso3(iso3)
    iso2 = iso3_to_iso2.fetch(iso3)
    [iso2, iso3]
  end

  def self.from_name(raw)
    key = normalize_name(raw)
    return [nil, nil] unless key

    iso2 = name_to_iso2[key]
    return [nil, nil] unless iso2

    [iso2, country_data.fetch(iso2)[:iso3]]
  end

  def self.build_result(iso2, iso3)
    name = country_data.fetch(iso2)[:name]
    { iso2: iso2, iso3: iso3, name: name }
  end

  private_class_method :load_reference_data, :build_country_data, :build_name_to_iso2,
                       :build_reference_cache, :reference_cache, :country_data, :iso3_to_iso2,
                       :name_to_iso2, :resolve_codes, :from_iso2, :from_iso3, :from_name,
                       :build_result
end
