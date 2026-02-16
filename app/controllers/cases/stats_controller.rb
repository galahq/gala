# frozen_string_literal: true

module Cases
  class StatsController < ApplicationController
    before_action :authenticate_reader!
    before_action :set_case

    STATS_PAGE_CACHE_TTL = 1.hour.freeze

    layout 'admin'
    helper Cases::StatsHelper

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
        AND e."time" < $3
        AND invisible_readers.reader_id IS NULL
      GROUP BY 1
      ORDER BY unique_visits DESC NULLS LAST
    SQL

    # @param [GET] /cases/:case_slug/stats
    def show
      respond_to do |format|
        format.html { render_overview }
        format.json { render json: { data: data_payload } }
        format.csv { prepare_csv_download }
      end
    end

    private

    def set_case
      @case = Case.friendly.find(case_slug_param).decorate
      authorize @case, :stats?
    end

    def render_overview
      load_overview_data
      render :show
    end

    def prepare_csv_download
      @csv_rows = normalized_rows
      response.headers['Content-Type'] = 'text/csv; charset=utf-8'
      response.headers['Content-Disposition'] =
        ActionDispatch::Http::ContentDisposition.format(
          disposition: 'attachment',
          filename: csv_filename
        )
    end

    def load_overview_data
      @min_date = min_date
      @stats_locales = stats_locales
      @all_time_summary = all_time_summary
    end

    def case_slug_param
      params[:case_slug].presence || params[:slug]
    end

    def min_date
      @min_date ||= @case.created_at.to_date
    end

    def stats_locales
      [
        @case.locale,
        *@case.translation_set.pluck(:locale)
      ]
        .compact.uniq.map(&:to_s)
    end

    def all_time_summary
      Rails.cache.fetch(overview_summary_cache_key, expires_in: STATS_PAGE_CACHE_TTL) do
        summary = CaseStatsService.format_country_stats(query_rows(all_time_range))
        summary.slice(:total_visits, :country_count)
      end
    end

    def overview_summary_cache_key
      ['cases/stats/overview-summary', @case.id]
    end

    def all_time_range
      build_time_range(min_date, Date.current)
    end

    def parse_date(value)
      return nil if value.blank?

      Date.iso8601(value.to_s)
    rescue ArgumentError
      nil
    end

    def stats_range
      @stats_range ||= begin
        from_date = [parse_date(params[:from]) || min_date, min_date].max
        to_date = [parse_date(params[:to]) || Date.current, from_date].max
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
