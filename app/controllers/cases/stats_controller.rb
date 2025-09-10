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
        format.json { render json: sql_query }
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
      from_ts ||= Time.zone.parse(@case.created_at)
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
          ), kase AS (
            SELECT c.id AS case_id, c.slug AS case_slug
            FROM cases c
            JOIN params p ON c.slug = p.case_slug
            LIMIT 1
          )
          SELECT
            v.country AS country,
            MIN(e."time") AS first_event,
            MAX(e."time") AS last_event,
            COUNT(DISTINCT v.visitor_token) AS session_count,
            COUNT(DISTINCT e.user_id) AS user_count,
            MAX(dep.deployments_count) AS deployments_count,
            COUNT(*) AS events_count
          FROM kase k
          JOIN params p ON TRUE
          CROSS JOIN LATERAL (
            SELECT COUNT(*)::bigint AS deployments_count
            FROM deployments d
            WHERE d.case_id = k.case_id
              AND d.created_at BETWEEN p.from_ts AND p.to_ts
          ) dep
          JOIN ahoy_events e
            ON (e.properties ->> 'case_slug') = k.case_slug
           AND e."time" BETWEEN p.from_ts AND p.to_ts
           AND e.user_id IS NOT NULL
           AND NOT EXISTS (
             SELECT 1
             FROM readers_roles rr
             JOIN roles ro ON ro.id = rr.role_id
             WHERE rr.reader_id = e.user_id AND ro.name = 'invisible'
           )
          JOIN visits v ON v.id = e.visit_id
          GROUP BY v.country
          ORDER BY events_count DESC NULLS LAST;
        SQL
      ).to_a
    end
  end
end
