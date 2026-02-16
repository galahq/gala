# frozen_string_literal: true

module Cases
  class StatsController < ApplicationController
    before_action :authenticate_reader!
    before_action :set_case

    CACHE_EXPIRES_IN = 24.hours

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

    # @param [GET] /cases/:case_slug/stats
    def show
      respond_to do |format|
        format.html do
          if stale? etag: stats_cache_key, last_modified: @case.updated_at.utc
            @cached_overview_html = cached_overview_html
            render :show, layout: 'admin'
          end
        end
        format.json { render json: { data: data_payload } }
        format.csv { prepare_csv_download }
      end
    end

    # @param [GET] /cases/:case_slug/stats/overview
    # Returns just the overview partial HTML for AJAX refresh
    def overview
      # Invalidate cache to get fresh data
      Rails.cache.delete(overview_cache_key)

      render partial: 'overview', locals: { overview: partial_locals }
    end

    private

    def set_case
      @case = Case.friendly.find(params[:case_slug]).decorate
      authorize @case, :stats?
    end

    # Builds a cache key with consistent structure:
    # "stats/{namespace}/{case_id}/{version_key}"
    # @param namespace [String] Cache namespace (e.g., 'overview', 'rows')
    # @param version_key [String] Optional version identifier (defaults to stats_cache_key)
    # @return [String]
    def build_cache_key(namespace, version_key: nil)
      version = version_key || stats_cache_key
      "stats/#{namespace}/#{@case.id}/#{version}"
    end

    def stats_cache_key
      @stats_cache_key ||= Ahoy::Event.cache_key(kase: @case)
    end

    def overview_cache_key
      build_cache_key('overview')
    end

    def cached_overview_html
      Rails.cache.fetch(overview_cache_key, expires_in: CACHE_EXPIRES_IN) do
        render_to_string(partial: 'overview', locals: { overview: partial_locals })
      end
    end

    def partial_locals
      @partial_locals ||= {
        published_at: @case.published_at,
        locales: [@case.locale, *@case.translation_set.pluck(:locale)].compact.uniq.to_a.join(', ') || '',
        deployments: @case.deployments.count,
        total_visits: normalized_rows.sum { |row| row[:unique_visits] },
        country_count: normalized_rows.length
      }
    end

    def prepare_csv_download
      @csv_rows = normalized_rows

      send_data render_to_string(template: 'cases/stats/show', formats: [:csv]),
                type: 'text/csv; charset=utf-8',
                filename: csv_filename,
                disposition: 'attachment'
    end

    def parse_date(value)
      return nil if value.blank?

      Date.iso8601(value.to_s)
    rescue ArgumentError
      nil
    end

    def stats_range
      @stats_range ||= begin
        from_date = [parse_date(params[:from]), @case.created_at.to_date].compact.max
        to_date = [parse_date(params[:to]) || Date.current, from_date].compact.max
        build_time_range(from_date, to_date)
      end
    end

    def build_time_range(from_date, to_date)
      {
        from_time: from_date.beginning_of_day,
        to_time: (to_date + 1.day).beginning_of_day
      }
    end

    def query_bindings(range)
      [
        query_attribute('case_id', @case.id, ActiveRecord::Type::Integer.new),
        query_attribute('from_time', range[:from_time], ActiveRecord::Type::DateTime.new),
        query_attribute('to_time', range[:to_time], ActiveRecord::Type::DateTime.new)
      ]
    end

    def query_attribute(name, value, type)
      ActiveRecord::Relation::QueryAttribute.new(name, value, type)
    end

    def query_rows(range)
      ActiveRecord::Base.connection.exec_query(
        COUNTRY_STATS_SQL,
        'Case Stats',
        query_bindings(range)
      ).to_a
    end

    def normalized_rows
      @normalized_rows ||= CaseStatsService.format_country_stats(
        query_rows(stats_range)
      )[:stats]
    end

    def data_payload
      CaseStatsService.api_data(normalized_rows)
    end

    def csv_filename
      I18n.t(
        'cases.stats.csv_filename',
        slug: @case.slug,
        date: Date.current.strftime('%Y-%m-%d')
      )
    end
  end
end
