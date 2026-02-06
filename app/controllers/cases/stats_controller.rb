# frozen_string_literal: true

module Cases
  # The stats for a {Case} include its slug, what library it is in, etc.
  class StatsController < ApplicationController
    before_action :authenticate_reader!
    layout 'admin'

    # @param [GET] /cases/case-slug/stats
    def show
      set_case
      @sql_query = sql_query_sql
      respond_to do |format|
        format.html do
          @min_date = min_date
          render :show
        end
        format.json { render json: stats_data }
        format.csv do
          filename = I18n.t('cases.stats.csv_filename',
                            slug: @case.slug,
                            date: Date.current.strftime('%Y-%m-%d'))
          send_data generate_csv, filename: filename
        end
      end
    end

    private

    def set_case
      @case = Case.friendly.find(params[:case_slug]).decorate
      authorize @case, :update?
    end

    def bindings
      build_bindings(stats_range[:from_ts], stats_range[:to_ts])
    end

    def build_bindings(from_ts, to_ts)
      [
        ActiveRecord::Relation::QueryAttribute.new(
          'case_id', @case.id, ActiveRecord::Type::Integer.new
        ),
        ActiveRecord::Relation::QueryAttribute.new(
          'from_ts', from_ts, ActiveRecord::Type::DateTime.new
        ),
        ActiveRecord::Relation::QueryAttribute.new(
          'to_ts', to_ts, ActiveRecord::Type::DateTime.new
        )
      ]
    end

    def sql_query_sql
      <<~SQL
        WITH params(case_id, from_ts, to_ts) AS (
          VALUES ($1::bigint, $2::timestamp, $3::timestamp)
        )
        SELECT
          v.country                                                       AS country,
          MIN(e."time")                                                   AS first_event,
          MAX(e."time")                                                   AS last_event,
          COUNT(DISTINCT v.visitor_token)                                 AS unique_visits,
          COUNT(DISTINCT e.user_id)                                       AS unique_users,
          COUNT(*)                                                        AS events_count,
          COUNT(*) FILTER (WHERE e.name = 'visit_podcast')                AS visit_podcast_count
        FROM ahoy_events e
        INNER JOIN cases c ON c.id = e.case_id
        INNER JOIN params p ON TRUE
        INNER JOIN visits v ON v.id = e.visit_id
        WHERE e.case_id = p.case_id
          AND e."time" BETWEEN p.from_ts AND p.to_ts
          AND NOT EXISTS (
            SELECT 1
            FROM readers_roles rr
            JOIN roles ro ON ro.id = rr.role_id
            WHERE rr.reader_id = e.user_id AND ro.name = 'invisible'
          )
        GROUP BY v.country
        ORDER BY unique_visits DESC NULLS LAST;
      SQL
    end

    def sql_query
      sql = sql_query_sql
      ActiveRecord::Base.connection.exec_query(
        sql,
        'Case Stats',
        bindings
      ).to_a
    end

    def stats_data
      formatted_data = stats_metrics
      {
        meta: meta_payload,
        range: range_payload,
        summary: summary_payload(formatted_data),
        countries: countries_payload(formatted_data, include_bins: true),
        bins: bins_payload(formatted_data)
      }
    end

    def case_locales
      @case.translation_set.pluck(:locale).uniq.sort do |a, b|
        if a == @case.locale && b != @case.locale
          -1
        elsif b == @case.locale && a != @case.locale
          1
        else
          a <=> b
        end
      end
    end

    def case_published_at_iso
      @case.published_at&.to_date&.iso8601
    end

    def deployments_count
      @deployments_count ||= @case.deployments.count
    end

    def min_date
      (@case.published_at || @case.created_at)&.to_date
    end

    def stats_range
      @stats_range ||= begin
        from_ts =
          params[:from].present? ? Time.zone.parse(params[:from]) : nil
        to_ts = params[:to].present? ? Time.zone.parse(params[:to]).end_of_day : nil
        from_ts ||= @case.published_at || @case.created_at
        to_ts ||= Time.zone.now.end_of_day
        { from_ts: from_ts, to_ts: to_ts }
      end
    end

    def range_payload
      {
        from: stats_range[:from_ts]&.iso8601,
        to: stats_range[:to_ts]&.iso8601,
        timezone: Time.zone.name
      }
    end

    def meta_payload
      {
        case: {
          id: @case.id,
          slug: @case.slug,
          published_at: case_published_at_iso,
          locales: case_locales,
          total_deployments: deployments_count
        },
        generated_at: Time.zone.now.iso8601
      }
    end

    def summary_payload(formatted_data)
      {
        total_visits: formatted_data[:total_visits],
        country_count: formatted_data[:country_count],
        total_podcast_listens: formatted_data[:total_podcast_listens]
      }
    end

    def countries_payload(formatted_data, include_bins:)
      (formatted_data[:stats] || []).map do |row|
        payload = {
          country: {
            iso2: row[:iso2],
            iso3: row[:iso3],
            name: row[:name]
          },
          metrics: {
            unique_visits: row[:unique_visits],
            unique_users: row[:unique_users],
            events_count: row[:events_count],
            visit_podcast_count: row[:visit_podcast_count]
          },
          first_event: row[:first_event],
          last_event: row[:last_event]
        }
        payload[:bin] = row[:bin] if include_bins
        payload
      end
    end

    def bins_payload(formatted_data)
      {
        metric: 'unique_visits',
        bin_count: formatted_data[:bin_count],
        bins: formatted_data[:bins]
      }
    end

    def stats_metrics
      raw_data = sql_query
      CountryStatsService.format_country_stats(
        raw_data,
        include_stats: true,
        include_bins: true
      )
    end

    def format_date(date)
      return nil unless date
      return nil unless date.respond_to?(:strftime)

      date.strftime('%Y-%m-%d %H:%M')
    rescue StandardError
      nil
    end

    def generate_csv # rubocop:disable Metrics/MethodLength, Metrics/AbcSize
      require 'csv'
      countries = stats_data[:countries] || []

      # Calculate totals
      total_visits = countries.sum { |r| r.dig(:metrics, :unique_visits) || 0 }
      total_users = countries.sum { |r| r.dig(:metrics, :unique_users) || 0 }
      total_events = countries.sum { |r| r.dig(:metrics, :events_count) || 0 }

      CSV.generate(headers: true) do |csv| # rubocop:disable Metrics/BlockLength
        csv << [
          I18n.t('cases.stats.csv.country'),
          I18n.t('cases.stats.csv.unique_visitors'),
          I18n.t('cases.stats.csv.unique_users'),
          I18n.t('cases.stats.csv.total_events'),
          I18n.t('cases.stats.csv.first_visit'),
          I18n.t('cases.stats.csv.last_visit')
        ]

        countries.each do |row|
          csv << [
            row.dig(:country, :name),
            row.dig(:metrics, :unique_visits),
            row.dig(:metrics, :unique_users),
            row.dig(:metrics, :events_count),
            format_date(row[:first_event]),
            format_date(row[:last_event])
          ]
        end

        csv << [
          I18n.t('cases.stats.csv.total'),
          total_visits,
          total_users,
          total_events,
          nil,
          nil
        ]
      end
    end
  end
end
