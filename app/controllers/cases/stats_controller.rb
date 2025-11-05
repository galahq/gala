# frozen_string_literal: true

module Cases
  # The stats for a {Case} include its slug, what library it is in, etc.
  class StatsController < ApplicationController
    before_action :authenticate_reader!
    layout 'admin'

    # @param [GET] /cases/case-slug/stats
    def show
      redirect_to '/403' and return unless current_reader&.has_role? :editor

      set_case
      @sql_query = sql_query_sql
      respond_to do |format|
        format.html { render :show }
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
      authorize @case
    end

    def bindings
      from_ts =
        params[:from].present? ? Time.zone.parse(params[:from]) : nil
      to_ts = params[:to].present? ? Time.zone.parse(params[:to]).end_of_day : nil
      from_ts ||= @case.created_at
      to_ts ||= Time.zone.now.end_of_day
      [
        ActiveRecord::Relation::QueryAttribute.new(
          'case_slug', @case.slug, ActiveRecord::Type::String.new
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
        WITH params(case_slug, from_ts, to_ts) AS (
          VALUES ($1::text, $2::timestamp, $3::timestamp)
        )
        SELECT
          v.country                                                       AS country,
          MIN(e."time")                                                   AS first_event,
          MAX(e."time")                                                   AS last_event,
          MAX(c.published_at)                                             AS case_published_at,
          COUNT(DISTINCT v.visitor_token)                                 AS unique_visits,
          COUNT(DISTINCT e.user_id)                                       AS unique_users,
          COUNT(*)                                                        AS events_count,
          MAX(dc.deployments_count)                                       AS deployments_count,
          COUNT(DISTINCT CASE WHEN e.name = 'visit_podcast' THEN e.id END) AS visit_podcast_count
        FROM ahoy_events e
        INNER JOIN cases c ON c.slug = e.properties ->> 'case_slug'
        INNER JOIN params p ON TRUE
        INNER JOIN visits v ON v.id = e.visit_id
        LEFT JOIN LATERAL (
          SELECT COUNT(DISTINCT d.id) AS deployments_count
          FROM deployments d
          WHERE d.case_id = c.id
        ) dc ON TRUE
        WHERE (e.properties ->> 'case_slug') = p.case_slug
          AND e."time" BETWEEN p.from_ts AND p.to_ts
          AND v.country IS NOT NULL AND trim(v.country) != ''
          AND NOT EXISTS (
            SELECT 1
            FROM readers_roles rr
            JOIN roles ro ON ro.id = rr.role_id
            WHERE rr.reader_id = e.user_id AND ro.name = 'invisible'
          )
        GROUP BY v.country, c.id
        ORDER BY unique_visits DESC NULLS LAST;
      SQL
    end

    def sql_query
      sql = sql_query_sql
      ActiveRecord::Base.connection.exec_query(sql, 'Case Stats', bindings).to_a
    end

    def stats_data
      raw_data = sql_query
      formatted_data = CountryStatsService.format_country_stats(raw_data)

      # Get translations separately
      case_locales = @case.translation_set.pluck(:locale).uniq.sort do |a, b|
        # Put base case locale first
        if a == @case.locale && b != @case.locale
          -1
        elsif b == @case.locale && a != @case.locale
          1
        else
          a <=> b
        end
      end.join(', ')

      {
        by_event: raw_data,
        formatted: formatted_data[:stats],
        summary: {
          total_visits: formatted_data[:total_visits],
          country_count: formatted_data[:country_count],
          total_deployments: @case.deployments.count,
          total_podcast_listens: formatted_data[:total_podcast_listens],
          case_published_at: @case.published_at&.strftime(I18n.t('date.formats.stats')),
          case_locales: case_locales,
          bins: formatted_data[:bins],
          bin_count: formatted_data[:bin_count]
        }
      }
    end

    def format_date(date)
      return nil unless date
      return nil unless date.respond_to?(:strftime)

      date.strftime('%Y-%m-%d %H:%M')
    rescue StandardError
      nil
    end

    def generate_csv
      require 'csv'
      formatted_stats = stats_data[:formatted]

      # Calculate totals
      total_visits = formatted_stats.sum { |r| r[:unique_visits] }
      total_users = formatted_stats.sum { |r| r[:unique_users] }
      total_events = formatted_stats.sum { |r| r[:events_count] }

      CSV.generate(headers: true) do |csv|
        csv << [
          I18n.t('cases.stats.csv.country'),
          I18n.t('cases.stats.csv.unique_visitors'),
          I18n.t('cases.stats.csv.unique_users'),
          I18n.t('cases.stats.csv.total_events'),
          I18n.t('cases.stats.csv.first_visit'),
          I18n.t('cases.stats.csv.last_visit')
        ]

        formatted_stats.each do |row|
          csv << [
            row[:name],
            row[:unique_visits],
            row[:unique_users],
            row[:events_count],
            format_date(row[:first_event]),
            format_date(row[:last_event])
          ]
        end

        # Add totals row
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
