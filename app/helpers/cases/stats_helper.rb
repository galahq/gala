# frozen_string_literal: true

# Helper methods for cases/stats
module Cases
  # CSV helper methods for cases/stats
  module StatsHelper
    def stats_csv_headers
      [
        t('cases.stats.csv.country'),
        t('cases.stats.csv.unique_visitors'),
        t('cases.stats.csv.first_visit'),
        t('cases.stats.csv.last_visit')
      ]
    end

    def stats_csv_row(row)
      [
        row[:name],
        row[:unique_visits].to_i,
        stats_csv_time(row[:first_event]),
        stats_csv_time(row[:last_event])
      ]
    end

    def stats_csv_total_row(rows)
      [
        t('cases.stats.csv.total'),
        rows.sum { |row_data| row_data[:unique_visits].to_i },
        nil,
        nil
      ]
    end

    def stats_csv_time(value)
      value&.in_time_zone&.strftime('%Y-%m-%d %H:%M')
    end
  end
end
