# frozen_string_literal: true

class CaseStatsService
  # Encapsulates the SQL query execution for country stats
  class Query
    COUNTRY_STATS_SQL = <<~SQL.freeze
      SELECT
        COALESCE(NULLIF(BTRIM(v.country), ''), 'Unknown')              AS country,
        MIN(e."time")                                                  AS first_event,
        MAX(e."time")                                                  AS last_event,
        COUNT(DISTINCT v.visitor_token)                                AS unique_visits,
        COUNT(DISTINCT e.user_id) FILTER (WHERE e.user_id IS NOT NULL) AS unique_users,
        COUNT(*)                                                       AS events_count,
        COUNT(*) FILTER (WHERE e.name = 'visit_podcast')               AS visit_podcast_count
      FROM ahoy_events e
      LEFT JOIN visits v ON v.id = e.visit_id
      LEFT JOIN (
        SELECT DISTINCT rr.reader_id
        FROM readers_roles rr
        INNER JOIN roles ro ON ro.id = rr.role_id
        WHERE ro.name = 'invisible'
      ) invisible_readers ON invisible_readers.reader_id = e.user_id
      WHERE e.case_id = $1
        AND e."time" >= $2
        AND e."time" <= $3
        AND invisible_readers.reader_id IS NULL
      GROUP BY 1
      ORDER BY unique_visits DESC NULLS LAST
    SQL

    attr_reader :kase, :time_range

    def initialize(kase, time_range)
      @kase = kase
      @time_range = time_range
    end

    def execute
      ActiveRecord::Base.connection.exec_query(COUNTRY_STATS_SQL, 'Case Stats', bindings).to_a
    end

    private

    def bindings
      [
        bind('case_id', kase.id, ActiveRecord::Type::Integer.new),
        bind('from_time', time_range[:from_time], ActiveRecord::Type::DateTime.new),
        bind('to_time', time_range[:to_time], ActiveRecord::Type::DateTime.new)
      ]
    end

    def bind(name, value, type)
      ActiveRecord::Relation::QueryAttribute.new(name, value, type)
    end
  end
end
