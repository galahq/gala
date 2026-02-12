# frozen_string_literal: true

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

  def self.format_country_stats(raw_stats, include_stats: true)
    merged = merge_stats(raw_stats)

    {
      stats: include_stats ? sort_stats(merged) : [],
      total_visits: merged.sum { |r| r[:unique_visits] },
      country_count: merged.count { |r| r[:iso2].present? },
      total_deployments: merged.map { |r| r[:deployments_count] }.max.to_i,
      total_podcast_listens: merged.sum { |r| r[:visit_podcast_count] }
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

  def self.unknown_value?(value)
    CountryReference.unknown?(value)
  end

  def self.merge_key(country)
    return "iso2:#{country[:iso2]}" if country[:iso2].present?
    return 'unknown' if unknown_value?(country[:name].to_s)

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
    dst[:unique_visits] += src['unique_visits'].to_i
    dst[:unique_users] += src['unique_users'].to_i
    dst[:events_count] += src['events_count'].to_i
    dst[:deployments_count] += src['deployments_count'].to_i
    dst[:visit_podcast_count] += src['visit_podcast_count'].to_i
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
    rows.sort_by { |r| [-r[:unique_visits], r[:name].to_s] }
  end

  private_class_method :unknown_value?, :merge_key, :default_row,
                       :apply_row!, :min_time, :max_time, :sort_stats
end
