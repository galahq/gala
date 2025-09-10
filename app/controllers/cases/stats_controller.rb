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
              SELECT
                c.id AS case_id,
                c.slug AS case_slug,
                c.translation_base_id AS translation_base_id,
                c.library_id AS library_id,
                c.locale,
                c.published_at,
                c.created_at,
                c.updated_at,
                c.title,
                c.license
              FROM cases c
              CROSS JOIN params p
              WHERE c.slug = p.case_slug
              LIMIT 1
            ),
            friendly_slugs AS (
              SELECT s.slug AS friendly_slug
              FROM friendly_id_slugs s
              CROSS JOIN kase k
              WHERE s.sluggable_type = 'Case'
                AND s.sluggable_id = k.case_id
              ORDER BY s.id DESC
              LIMIT 1
            ),
            translations AS (
              SELECT
                c.id AS translation_id,
                c.slug AS translation_slug,
                c.locale AS translation_locale,
                c.published_at AS translation_published_at,
                c.created_at AS translation_created_at,
                c.updated_at AS translation_updated_at
              FROM cases c
              CROSS JOIN kase k
              WHERE c.translation_base_id = k.case_id
                AND c.locale <> k.locale
            ),
            deployments AS (
              SELECT d.id AS deployment_id
              FROM deployments d
              CROSS JOIN kase k
              CROSS JOIN params p
              WHERE d.case_id = k.case_id
                AND d.created_at BETWEEN p.from_ts AND p.to_ts
            ),
            events AS (
              SELECT
                e.id AS event_id,
                e.visit_id AS event_visit_id,
                e.user_id AS event_user_id,
                e."time" AS event_time,
                e.properties ->> 'case_slug' AS event_case_slug,
                e.properties ->> 'element_type' AS element_type,
                e.properties ->> 'element_id' AS element_id
              FROM ahoy_events e
              CROSS JOIN params p
              WHERE e.properties ->> 'case_slug' = p.case_slug
                AND e."time" BETWEEN p.from_ts AND p.to_ts
            ),
            interesting_readers AS (
              SELECT DISTINCT r.id AS reader_id,
                              r.locale AS locale
              FROM events e
              JOIN readers r ON r.id = e.event_user_id
              LEFT JOIN readers_roles rr ON rr.reader_id = r.id
              LEFT JOIN roles ro ON ro.id = rr.role_id
              WHERE e.event_user_id IS NOT NULL
                AND COALESCE(ro.name, '') <> 'invisible'
            ),
            visit_stats AS (
              SELECT
                MIN(e.event_time) AS first_event_at,
                MAX(e.event_time) AS last_event_at,
                COUNT(DISTINCT v.visitor_token) AS session_count,
                COUNT(DISTINCT ir.reader_id) AS user_count
              FROM events e
              JOIN visits v ON v.id = e.event_visit_id
              CROSS JOIN params p
              LEFT JOIN interesting_readers ir
                ON ir.reader_id = e.event_user_id
              WHERE v.started_at BETWEEN p.from_ts AND p.to_ts
            ),
            by_events AS (
              SELECT
                v.country AS country,
                string_agg(DISTINCT ir.locale, ' ') AS locales,
                string_agg(DISTINCT t.translation_locale, ' ') AS translations,
                COUNT(DISTINCT d.deployment_id) AS deployments_count,
                MAX(vs.session_count) AS session_count,
                MAX(vs.user_count) AS user_count,
                MIN(e.event_time) AS first_event,
                MAX(e.event_time) AS last_event,
                MAX(k.published_at) AS published_at,
                MAX(k.title) AS title,
                MAX(k.locale) AS case_locale,
                MAX(k.license) AS license,
                MAX(k.updated_at) AS updated_at,
                MAX(k.created_at) AS created_at,
                COUNT(DISTINCT e.event_id) AS events_count,
                COUNT(DISTINCT ir.reader_id) AS interesting_readers_count,
                string_agg(DISTINCT fs.friendly_slug, ' ') AS friendly_slugs
              FROM kase k
              CROSS JOIN params p
              LEFT JOIN friendly_slugs fs ON TRUE
              LEFT JOIN translations t ON TRUE
              LEFT JOIN events e
                ON e.event_case_slug = k.case_slug
                   AND e.event_time BETWEEN p.from_ts AND p.to_ts
              LEFT JOIN visits v ON v.id = e.event_visit_id
              LEFT JOIN deployments d ON TRUE
              LEFT JOIN interesting_readers ir
                ON ir.reader_id = e.event_user_id
              LEFT JOIN visit_stats vs ON TRUE
              GROUP BY v.country
            )
          SELECT *
          FROM by_events;
        SQL
      ).to_a
    end
  end
end
