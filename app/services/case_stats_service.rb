# frozen_string_literal: true

# Queries and formats per-country stats for a Case.
# Encapsulates the stats SQL query, date range handling, data normalization, and caching.
#
# @example
#   service = CaseStatsService.new(kase, from: '2024-01-01', to: '2024-12-31')
#   service.country_stats  # => { stats: [...], total_visits: n, ... }
#   service.api_data       # => formatted array for JSON response
#   service.stats_rows     # => raw normalized rows for CSV
class CaseStatsService
  attr_reader :kase, :from_date, :to_date

  # @param kase [Case] The case to query stats for
  # @param from [String, Date, nil] Start date (ISO8601 string or Date)
  # @param to [String, Date, nil] End date (ISO8601 string or Date)
  def initialize(kase, from: nil, to: nil)
    @kase = kase
    @from_date = resolve_from_date(from)
    @to_date = resolve_to_date(to)
  end

  # @return [Hash] Aggregated country stats with totals (cached)
  def country_stats
    @country_stats ||= Rails.cache.fetch(cache_key, expires_in: 1.hours) do
      Formatter.format_country_stats(query.execute)
    end
  end

  # @return [String] Cache key for invalidation
  def cache_key
    @cache_key ||= "stats/data/#{kase.id}/#{from_date.iso8601}/#{to_date.iso8601}/#{event_version_key}"
  end

  # @return [Array<Hash>] Normalized stat rows (for CSV or iteration)
  def stats_rows
    country_stats[:stats]
  end

  # @return [Array<Hash>] Formatted data for API/JSON response
  def api_data
    stats_rows.map { |row| Formatter.api_row(row) }
  end

  # @return [Integer] Total unique visits across all countries
  def total_visits
    country_stats[:total_visits]
  end

  # @return [Integer] Number of distinct countries
  def country_count
    country_stats[:country_count]
  end

  # @return [Integer] Total podcast listens
  def total_podcast_listens
    country_stats[:total_podcast_listens]
  end

  # @return [Hash] Date range used for the query
  def date_range
    { from: from_date, to: to_date }
  end

  private

  def query
    @query ||= Query.new(kase, time_range)
  end

  def resolve_from_date(value)
    parsed = parse_date(value)
    [parsed, kase.created_at.to_date].compact.max
  end

  def resolve_to_date(value)
    parsed = parse_date(value) || Date.current
    [parsed, from_date].compact.max
  end

  def parse_date(value)
    return nil if value.blank?
    return value if value.is_a?(Date)

    Date.iso8601(value.to_s)
  rescue ArgumentError
    nil
  end

  def time_range
    {
      from_time: from_date.beginning_of_day,
      to_time: (to_date + 1.day).beginning_of_day
    }
  end

  def event_version_key
    Ahoy::Event.cache_key(kase: kase)
  end
end
