# frozen_string_literal: true

# Formats per-country rows from stats SQL for UI/API consumers.
class CaseStatsService
  UNKNOWN_COUNTRY = 'Unknown'
  NUMERIC_KEYS = %i[
    unique_visits
    unique_users
    events_count
    visit_podcast_count
  ].freeze
  DEFAULT_COUNTRY_STATS = {
    unique_visits: 0,
    unique_users: 0,
    events_count: 0,
    visit_podcast_count: 0,
    first_event: nil,
    last_event: nil
  }.freeze

  def self.format_country_stats(raw_stats)
    stats = sort_stats(merge_stats(raw_stats))

    {
      stats: stats,
      total_visits: stats.sum { |row| row[:unique_visits] },
      country_count: stats.length,
      total_podcast_listens: stats.sum { |row| row[:visit_podcast_count] }
    }
  end

  def self.api_data(rows)
    rows.map { |row| api_row(row) }
  end

  def self.merge_stats(raw_stats)
    raw_stats.each_with_object({}) do |row, acc|
      country = resolve_country(row['country'])
      key = merge_key(country)

      acc[key] ||= default_row(country)
      apply_row!(acc[key], row)
    end.values
  end

  def self.resolve_country(input)
    CountryReference.resolve(input)
  end

  def self.merge_key(country)
    return "iso2:#{country[:iso2]}" if country[:iso2].present?

    country_name = country[:name].presence || UNKNOWN_COUNTRY
    return 'unknown' if CountryReference.unknown?(country_name)

    "name:#{country_name.downcase}"
  end

  def self.default_row(country)
    {
      iso2: country[:iso2],
      iso3: country[:iso3],
      name: country[:name].presence || UNKNOWN_COUNTRY
    }.merge(DEFAULT_COUNTRY_STATS)
  end

  def self.apply_row!(dst, src)
    NUMERIC_KEYS.each { |key| dst[key] += src[key.to_s].to_i }
    dst[:first_event] = min_time(dst[:first_event], src['first_event'])
    dst[:last_event] = max_time(dst[:last_event], src['last_event'])
  end

  def self.min_time(left_time, right_time)
    [left_time, right_time].compact.min
  end

  def self.max_time(left_time, right_time)
    [left_time, right_time].compact.max
  end

  def self.sort_stats(rows)
    rows.sort_by { |row| [-row[:unique_visits], row[:name].to_s] }
  end

  def self.api_row(row)
    {
      country: {
        iso2: row[:iso2],
        iso3: row[:iso3],
        name: row[:name]
      },
      metrics: api_metrics(row),
      first_event: row[:first_event]&.iso8601,
      last_event: row[:last_event]&.iso8601
    }
  end

  def self.api_metrics(row)
    {
      unique_visits: row[:unique_visits].to_i,
      unique_users: row[:unique_users].to_i,
      events_count: row[:events_count].to_i,
      visit_podcast_count: row[:visit_podcast_count].to_i
    }
  end

  private_class_method :merge_key, :default_row, :apply_row!,
                       :min_time, :max_time, :sort_stats,
                       :api_row, :api_metrics
end
