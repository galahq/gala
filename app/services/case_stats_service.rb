# frozen_string_literal: true

# Formats per-country rows from stats SQL for UI/API consumers.
class CaseStatsService
  EMPTY_STATS = {
    unique_visits: 0,
    unique_users: 0,
    events_count: 0,
    deployments_count: 0,
    visit_podcast_count: 0,
    first_event: nil,
    last_event: nil
  }.freeze

  ADD_KEYS = %i[
    unique_visits
    unique_users
    events_count
    deployments_count
    visit_podcast_count
  ].freeze

  def self.format_country_stats(raw_stats)
    merged = merge_stats(raw_stats)

    {
      stats: sort_stats(merged),
      total_visits: merged.sum { |row| row[:unique_visits] },
      country_count: merged.count,
      total_deployments: merged.map { |row| row[:deployments_count] }.max.to_i,
      total_podcast_listens: merged.sum { |row| row[:visit_podcast_count] }
    }
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
    return 'unknown' if CountryReference.unknown?(country[:name].to_s)

    "name:#{country[:name].to_s.downcase}"
  end

  def self.default_row(country)
    {
      iso2: country[:iso2],
      iso3: country[:iso3],
      name: country[:name].presence || 'Unknown'
    }.merge(EMPTY_STATS)
  end

  def self.apply_row!(dst, src)
    ADD_KEYS.each { |key| dst[key] += src[key.to_s].to_i }
    dst[:first_event] = min_time(dst[:first_event], src['first_event'])
    dst[:last_event] = max_time(dst[:last_event], src['last_event'])
  end

  def self.min_time(a, b)
    [a, b].compact.min
  end

  def self.max_time(a, b)
    [a, b].compact.max
  end

  def self.sort_stats(rows)
    rows.sort_by { |row| [-row[:unique_visits], row[:name].to_s] }
  end

  private_class_method :merge_key, :default_row, :apply_row!,
                       :min_time, :max_time, :sort_stats
end
