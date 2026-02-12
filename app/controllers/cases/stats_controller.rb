# frozen_string_literal: true

module Cases
  class StatsController < ApplicationController
    before_action :authenticate_reader!
    before_action :set_case

    layout 'admin'

    # @param [GET] /cases/:case_slug/stats
    def show
      respond_to do |format|
        format.html { render :show }
        format.json { render json: { data: data_payload } }
        format.csv do
          send_data(
            generate_csv,
            filename: csv_filename,
            type: 'text/csv; charset=utf-8'
          )
        end
      end
    end

    private

    def set_case
      @case = Case.friendly.find(case_slug_param).decorate
      @stats_locales = stats_locales
      @min_date = @case.published_at&.to_date || @case.created_at.to_date
      @initial_all_time_summary = all_time_summary
      authorize @case, :stats?
    end

    def case_slug_param
      params[:case_slug].presence || params[:slug]
    end

    def all_time_summary
      result = ActiveRecord::Base.connection.exec_query(
        all_time_summary_sql,
        'All Time Summary',
        [ActiveRecord::Relation::QueryAttribute.new('case_id', @case.id, ActiveRecord::Type::Integer.new)]
      ).first || {}

      {
        total_visits: result['total_visits'].to_i,
        country_count: result['country_count'].to_i
      }
    end

    def all_time_summary_sql
      <<~SQL
        SELECT
          COUNT(DISTINCT v.visitor_token) AS total_visits,
          COUNT(DISTINCT COALESCE(NULLIF(BTRIM(v.country), ''), 'Unknown')) AS country_count
        FROM ahoy_events e
        LEFT JOIN visits v ON v.id = e.visit_id
        WHERE e.case_id = $1
          AND NOT EXISTS (
            SELECT 1
            FROM readers_roles rr
            INNER JOIN roles ro ON ro.id = rr.role_id
            WHERE rr.reader_id = e.user_id AND ro.name = 'invisible'
          )
      SQL
    end

    def stats_locales
      current_locale = @case.locale
      current_locale = current_locale.to_s.strip if current_locale.present?
      translation_locales =
        Case.where(translation_base_id: @case.id)
            .where.not(id: @case.id)
            .where.not(locale: [nil, ''])
            .pluck(:locale)
            .map { |locale| locale.to_s.strip }

      seen = {}
      [current_locale, *translation_locales].each_with_object([]) do |locale, list|
        key = locale.to_s
        next if seen[key]

        seen[key] = true
        list << locale
      end
    end

    def csv_filename
      I18n.t(
        'cases.stats.csv_filename',
        slug: @case.slug,
        date: Date.current.strftime('%Y-%m-%d')
      )
    end

    def parse_date(value)
      return nil if value.blank?

      Date.iso8601(value.to_s)
    rescue StandardError
      Time.zone.parse(value.to_s)&.to_date
    end

    def stats_range
      lower_bound = @min_date || @case.created_at.to_date
      from_date = parse_date(params[:from]) || lower_bound
      from_date = lower_bound if from_date < lower_bound
      parsed_to_date = parse_date(params[:to])
      to_date = parsed_to_date || Time.zone.today
      to_date = from_date if parsed_to_date.present? && to_date < from_date
      { from_date: from_date, to_date: to_date }
    end

    def bindings
      [
        ActiveRecord::Relation::QueryAttribute.new(
          'case_id',
          @case.id,
          ActiveRecord::Type::Integer.new
        ),
        ActiveRecord::Relation::QueryAttribute.new(
          'from_date',
          stats_range[:from_date],
          ActiveRecord::Type::Date.new
        ),
        ActiveRecord::Relation::QueryAttribute.new(
          'to_date',
          stats_range[:to_date],
          ActiveRecord::Type::Date.new
        )
      ]
    end

    def sql_query_sql
      <<~SQL
        WITH params(case_id, from_date, to_date) AS (
          VALUES ($1::bigint, $2::date, $3::date)
        )
        SELECT
          COALESCE(NULLIF(BTRIM(v.country), ''), 'Unknown')              AS country,
          MIN(e."time")                                                  AS first_event,
          MAX(e."time")                                                  AS last_event,
          COUNT(DISTINCT v.visitor_token)                                AS unique_visits,
          COUNT(DISTINCT e.user_id) FILTER (WHERE e.user_id IS NOT NULL) AS unique_users,
          COUNT(*)                                                       AS events_count,
          COUNT(*) FILTER (WHERE e.name = 'visit_podcast')               AS visit_podcast_count
        FROM ahoy_events e
        INNER JOIN params p ON TRUE
        LEFT JOIN visits v ON v.id = e.visit_id
        WHERE e.case_id = p.case_id
          AND e."time"::date BETWEEN p.from_date AND p.to_date
          AND NOT EXISTS (
            SELECT 1
            FROM readers_roles rr
            INNER JOIN roles ro ON ro.id = rr.role_id
            WHERE rr.reader_id = e.user_id AND ro.name = 'invisible'
          )
        GROUP BY COALESCE(NULLIF(BTRIM(v.country), ''), 'Unknown')
        ORDER BY unique_visits DESC NULLS LAST;
      SQL
    end

    def sql_query
      ActiveRecord::Base.connection.exec_query(
        sql_query_sql,
        'Case Stats',
        bindings
      ).to_a
    end

    def normalized_rows
      @normalized_rows ||= CaseStatsService.format_country_stats(
        sql_query
      )[:stats] || []
    end

    def stats_service_class
      return CaseStatsService if defined?(CaseStatsService)
      return CountryStatsService if defined?(CountryStatsService)

      raise NameError, 'CaseStatsService (or legacy CountryStatsService) is not defined'
    end

    def data_payload
      normalized_rows.map do |row|
        {
          country: {
            iso2: row[:iso2],
            iso3: row[:iso3],
            name: row[:name]
          },
          metrics: {
            unique_visits: row[:unique_visits].to_i,
            unique_users: row[:unique_users].to_i,
            events_count: row[:events_count].to_i,
            visit_podcast_count: row[:visit_podcast_count].to_i
          },
          first_event: row[:first_event]&.iso8601,
          last_event: row[:last_event]&.iso8601
        }
      end
    end

    def format_date(value)
      return nil if value.blank?

      date =
        if value.respond_to?(:strftime)
          value
        else
          Time.zone.parse(value.to_s)
        end

      date&.strftime('%Y-%m-%d %H:%M')
    rescue StandardError
      nil
    end

    def generate_csv
      require 'csv'

      rows = data_payload
      total_visits = rows.sum { |row| row.dig(:metrics, :unique_visits).to_i }

      CSV.generate(headers: true) do |csv|
        csv << [
          I18n.t('cases.stats.csv.country'),
          I18n.t('cases.stats.csv.unique_visitors'),
          I18n.t('cases.stats.csv.first_visit'),
          I18n.t('cases.stats.csv.last_visit')
        ]

        rows.each do |row|
          csv << [
            row.dig(:country, :name),
            row.dig(:metrics, :unique_visits),
            format_date(row[:first_event]),
            format_date(row[:last_event])
          ]
        end

        csv << [
          I18n.t('cases.stats.csv.total'),
          total_visits,
          nil,
          nil
        ]
      end
    end
  end
end
