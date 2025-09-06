# frozen_string_literal: true

module Cases
  # The stats for a {Case} include its slug, what library it is in, etc.
  class StatsController < ApplicationController
    # before_action :authenticate_reader!

    layout 'admin'

    # @param [GET] /cases/case-slug/stats
    def show
      set_case
      set_libraries
      set_editorships
      respond_to do |format|
        format.html do
          set_group_and_deployment
          render :show
        end
        format.json { render json: stats_rows }
      end
    end

    private

    def set_case
      @case = Case.friendly.find(params[:case_slug]).decorate
      @case.licensor current_reader
      authorize @case
    end

    def set_libraries
      @libraries = LibraryPolicy::AdminScope.new(current_reader, Library)
                                            .resolve
    end

    def set_editorships
      @editorships = @case.editorships
    end

    def set_group_and_deployment
      @enrollment = current_user.enrollment_for_case @case
      @group = @enrollment.try(:active_group) || GlobalGroup.new
      @deployment = @group.deployment_for_case @case
    end

    def stats_rows
      from_param = params[:from].presence
      to_param = params[:to].presence

      from_date = from_param && (Date.parse(from_param) rescue nil)
      to_date = to_param && (Date.parse(to_param).next_day rescue nil)

      # Simple query for case associations (no date filtering needed)
      by_associations_sql = <<~SQL
        SELECT
          cases.id AS case_id,
          cases.slug AS case_slug,
          cases.published_at AS case_published_at,
          COALESCE(libraries.name->>'en', libraries.name::text) AS library_name,
          COUNT(DISTINCT edgenotes.id) AS edgenotes_count,
          COUNT(DISTINCT cards.id) AS cards_count,
          COUNT(DISTINCT case_elements.id) AS case_elements_count,
          COUNT(DISTINCT CASE WHEN case_elements.element_type = 'Page' THEN case_elements.element_id END) AS pages_count,
          COUNT(DISTINCT CASE WHEN case_elements.element_type = 'Podcast' THEN case_elements.element_id END) AS podcasts_count,
          COUNT(DISTINCT wikidata_links.id) AS wikidata_links_count,
          COUNT(DISTINCT deployments.id) AS deployments_count,
          COUNT(DISTINCT enrollments.id) AS enrollments_count,
          string_agg(DISTINCT COALESCE(editors.name, editors.email), ', ') AS authors_names,
          string_agg(DISTINCT COALESCE(managers.name, managers.email), ', ') AS managers_names,
          string_agg(DISTINCT COALESCE(translations.locale, ''), ', ') AS locales
        FROM cases
        LEFT JOIN libraries ON libraries.id = cases.library_id
        LEFT JOIN edgenotes ON edgenotes.case_id = cases.id
        LEFT JOIN cards ON cards.case_id = cases.id
        LEFT JOIN case_elements ON case_elements.case_id = cases.id
        LEFT JOIN wikidata_links ON wikidata_links.record_type = 'Case' AND wikidata_links.record_id = cases.id
        LEFT JOIN deployments ON deployments.case_id = cases.id
        LEFT JOIN enrollments ON enrollments.case_id = cases.id
        LEFT JOIN editorships ON editorships.case_id = cases.id
        LEFT JOIN readers AS editors ON editors.id = editorships.editor_id
        LEFT JOIN managerships ON managerships.library_id = cases.library_id
        LEFT JOIN readers AS managers ON managers.id = managerships.manager_id
        LEFT JOIN cases AS translations ON (translations.translation_base_id = cases.translation_base_id OR translations.id = cases.id) AND translations.locale IS NOT NULL AND translations.locale != cases.locale
        WHERE cases.id = ?
        GROUP BY cases.id, cases.slug, cases.published_at, libraries.name
      SQL

      # Simple query for events with date filtering
      date_filter = ''
      if from_date || to_date
        conditions = []
        conditions << "ahoy_events.time >= '#{from_date}'" if from_date
        conditions << "ahoy_events.time < '#{to_date}'" if to_date
        date_filter = "AND (#{conditions.join(' AND ')})"
      end

      event_names = %w[
        visit_page visit_element read_quiz read_overview read_card
        visit_podcast visit_edgenote write_comment write_comment_thread write_quiz_submission
      ]

      by_event_sql = <<~SQL
        SELECT
          COALESCE(event_counts.name, all_names.name) AS name,
          COALESCE(event_counts.count, 0) AS count,
          COALESCE(event_counts.countries, '') AS countries,
          COALESCE(event_counts.locales, '') AS locales
        FROM (VALUES #{event_names.map { |n| "('#{n}')" }.join(', ')}) AS all_names(name)
        LEFT JOIN (
          SELECT
            ahoy_events.name,
            COUNT(*) AS count,
            string_agg(DISTINCT COALESCE(visits.country, ''), ' ') AS countries,
            string_agg(DISTINCT COALESCE(readers.locale, ''), ' ') AS locales
          FROM ahoy_events
          LEFT JOIN visits ON visits.id = ahoy_events.visit_id
          LEFT JOIN readers ON readers.id = ahoy_events.user_id
          WHERE ahoy_events.properties->>'case_slug' = ?
          #{date_filter}
          GROUP BY ahoy_events.name
        ) AS event_counts ON event_counts.name = all_names.name
        ORDER BY name
      SQL

      # Execute queries
      by_associations = ActiveRecord::Base.connection.exec_query(
        ActiveRecord::Base.sanitize_sql_array([by_associations_sql, @case.id])
      ).first

      by_event = ActiveRecord::Base.connection.exec_query(
        ActiveRecord::Base.sanitize_sql_array([by_event_sql, @case.slug])
      ).to_a

      {
        by_associations: [by_associations].compact,
        by_event: by_event
      }
    rescue StandardError => e
      [{ error: e.class.name, message: e.message }]
    end
  end
end
