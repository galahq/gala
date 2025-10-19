# frozen_string_literal: true

module Cases
  # The stats for a {Case} include its slug, what library it is in, etc.
  class StatsController < ApplicationController
    # before_action :authenticate_reader!

    layout 'admin'

    AHOY_EVENT_NAMES = %w[
      visit_page visit_element read_quiz read_overview read_card
      visit_podcast visit_edgenote
    ].freeze

    DERIVED_EVENT_NAMES = %w[
      write_comment write_comment_thread write_quiz_submission
    ].freeze

    ALL_EVENT_NAMES = (AHOY_EVENT_NAMES + DERIVED_EVENT_NAMES).freeze

    # @param [GET] /cases/case-slug/stats
    def show
      set_case
      respond_to do |format|
        format.html { render :show }
        format.json { render json: stats_data }
        format.csv { send_data generate_csv, filename: "case-stats-#{@case.slug}-#{Date.current}.csv" }
      end
    end

    private

    def set_case
      @case = Case.friendly.find(params[:case_slug]).decorate
      @case.licensor current_reader
      authorize @case
    end

    def bindings
      from_ts =
        params[:from].present? ? Time.zone.parse(params[:from]) : nil
      to_ts = params[:to].present? ? Time.zone.parse(params[:to]) : nil
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

    def sql_query
      ActiveRecord::Base.connection.exec_query(
        <<~SQL, 'Case Stats', bindings
          WITH params(case_slug, from_ts, to_ts) AS (
            VALUES ($1::text, $2::timestamp, $3::timestamp)
          )
          SELECT
            v.country                                              AS country,
            MIN(e."time")                                        AS first_event,
            MAX(e."time")                                        AS last_event,
            COUNT(DISTINCT v.visitor_token)                        AS unique_visits,
            COUNT(DISTINCT e.user_id)                              AS unique_users,
            COUNT(*)                                               AS events_count
          FROM ahoy_events e
          JOIN params p ON TRUE
          JOIN visits v ON v.id = e.visit_id
          WHERE (e.properties ->> 'case_slug') = p.case_slug
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
      ).to_a
    end

    def stats_data
      raw_data = sql_query
      formatted_data = CountryStatsService.format_country_stats(raw_data)

      {
        by_event: raw_data,
        formatted: formatted_data[:stats],
        summary: {
          total_visits: formatted_data[:total_visits],
          country_count: formatted_data[:country_count],
          percentiles: formatted_data[:percentiles]
        }
      }
    end

    def generate_csv
      require 'csv'
      data = CountryStatsService.format_country_stats(sql_query)[:stats]

      CSV.generate(headers: true) do |csv|
        csv << ['Country', 'ISO2', 'ISO3', 'Unique Visits', 'Unique Users',
                'Total Events', 'First Visit', 'Last Visit']

        data.each do |row|
          csv << [
            row[:name],
            row[:iso2],
            row[:iso3],
            row[:unique_visits],
            row[:unique_users],
            row[:events_count],
            row[:first_event]&.strftime('%Y-%m-%d %H:%M'),
            row[:last_event]&.strftime('%Y-%m-%d %H:%M')
          ]
        end
      end
    end
  end
end
