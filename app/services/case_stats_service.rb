# frozen_string_literal: true

# Service class for calculating case statistics with optimized PostgreSQL queries
class CaseStatsService
  def initialize(case_record, date_range = nil)
    @case = case_record
    @date_range = date_range
  end

  def call
    {
      caseCreatedAt: @case.created_at,
      casePublishedAt: @case.published_at,
      caseUpdatedAt: @case.updated_at,
      deployments: {
        allTime: @case.deployments.size,
        customRange: stats[:deployments_count]
      },
      visits: {
        allTime: stats[:visits_all_time],
        customRange: stats[:visits_custom_range]
      },
      locales: {
        allTime: stats[:locales_all_time],
        customRange: stats[:locales_custom_range]
      },
      podcasts: format_podcast_stats(stats[:podcast_stats])
    }
  end

  private

  def stats
    @stats ||= calculate_stats
  end

  def calculate_stats
    date_conditions = build_date_conditions
    
    result = ActiveRecord::Base.connection.select_one(<<~SQL)
      WITH case_events AS (
        SELECT 
          e.id,
          e.user_id,
          e.name,
          e.properties,
          e.time,
          r.locale
        FROM ahoy_events e
        INNER JOIN readers r ON e.user_id = r.id
        WHERE e.properties ->> 'case_slug' = #{ActiveRecord::Base.connection.quote(@case.slug)}
          AND e.name = 'visit_element'
          AND r.id NOT IN (
            SELECT reader_id
            FROM readers_roles
            JOIN roles ON role_id = roles.id
            WHERE roles.name = 'invisible'
          )
      ),
      date_filtered_events AS (
        SELECT *
        FROM case_events
        WHERE time BETWEEN #{date_conditions[:start_date]} AND #{date_conditions[:end_date]}
      ),
      all_time_stats AS (
        SELECT 
          COUNT(DISTINCT user_id) as unique_visitors_all_time,
          STRING_AGG(DISTINCT locale, ', ' ORDER BY locale) as locales_all_time
        FROM case_events
      ),
      date_range_stats AS (
        SELECT 
          COUNT(DISTINCT user_id) as unique_visitors_custom_range,
          STRING_AGG(DISTINCT locale, ', ' ORDER BY locale) as locales_custom_range
        FROM date_filtered_events
      ),
      podcast_stats AS (
        SELECT 
          p.id as podcast_id,
          p.title as podcast_title,
          COUNT(CASE WHEN e.time BETWEEN #{date_conditions[:start_date]} AND #{date_conditions[:end_date]} THEN 1 END) as listens_custom_range,
          COUNT(*) as listens_all_time
        FROM podcasts p
        LEFT JOIN ahoy_events e ON e.properties ->> 'podcast_id' = p.id::text
          AND e.name = 'visit_podcast'
          AND e.user_id IN (
            SELECT id FROM readers 
            WHERE id NOT IN (
              SELECT reader_id FROM readers_roles
              JOIN roles ON role_id = roles.id
              WHERE roles.name = 'invisible'
            )
          )
        WHERE p.case_id = #{@case.id}
        GROUP BY p.id, p.title
      )
      SELECT 
        COALESCE(ats.unique_visitors_all_time, 0) as visits_all_time,
        COALESCE(drs.unique_visitors_custom_range, 0) as visits_custom_range,
        COALESCE(ats.locales_all_time, '') as locales_all_time,
        COALESCE(drs.locales_custom_range, '') as locales_custom_range,
        (SELECT COUNT(*) FROM deployments WHERE case_id = #{@case.id} 
         AND created_at BETWEEN #{date_conditions[:start_date]} AND #{date_conditions[:end_date]}) as deployments_count,
        (SELECT json_agg(
          json_build_object(
            'id', podcast_id,
            'title', podcast_title,
            'listens_all_time', listens_all_time,
            'listens_custom_range', listens_custom_range
          )
        ) FROM podcast_stats) as podcast_stats
      FROM all_time_stats ats
      CROSS JOIN date_range_stats drs
    SQL

    {
      visits_all_time: result['visits_all_time'].to_i,
      visits_custom_range: result['visits_custom_range'].to_i,
      locales_all_time: result['locales_all_time'].presence || 'N/A',
      locales_custom_range: result['locales_custom_range'].presence || 'N/A',
      deployments_count: result['deployments_count'].to_i,
      podcast_stats: result['podcast_stats'] ? JSON.parse(result['podcast_stats']) : []
    }
  end

  def build_date_conditions
    if @date_range && @date_range[:start_date] && @date_range[:end_date]
      start_date = Date.parse(@date_range[:start_date])
      end_date = Date.parse(@date_range[:end_date])
      
      {
        start_date: ActiveRecord::Base.connection.quote(start_date.beginning_of_day),
        end_date: ActiveRecord::Base.connection.quote(end_date.end_of_day)
      }
    else
      # Default to all time if no date range provided
      {
        start_date: ActiveRecord::Base.connection.quote(100.years.ago),
        end_date: ActiveRecord::Base.connection.quote(100.years.from_now)
      }
    end
  end

  def format_podcast_stats(podcast_stats)
    podcast_stats.map do |podcast|
      {
        id: podcast['id'],
        title: podcast['title'],
        listens: {
          allTime: podcast['listens_all_time'],
          customRange: podcast['listens_custom_range']
        }
      }
    end
  end
end
