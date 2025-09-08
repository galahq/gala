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
      query_type = params[:type].presence
      date_range = parse_date_range

      case query_type
      when 'by_associations'
        [associations]
      when 'by_event'
        events(date_range)
      else
        {
          by_associations: [associations],
          by_event: events(date_range)
        }
      end
    rescue StandardError => e
      { error: e.class.name, message: e.message }
    end

    def parse_date_range
      from_param = params[:from].presence
      to_param = params[:to].presence

      from_date = from_param && (Date.parse(from_param) rescue nil)
      to_date = to_param && (Date.parse(to_param).next_day rescue nil)

      { from: from_date, to: to_date }
    end

    def associations
      sql = <<~SQL
        WITH case_data AS (
          SELECT#{' '}
            c.id as case_id,
            c.slug as case_slug,
            c.published_at as case_published_at,
            CASE#{' '}
              WHEN l.name IS NOT NULL THEN#{' '}
                CASE#{' '}
                  WHEN jsonb_typeof(l.name) = 'object' AND l.name->>'en' IS NOT NULL#{' '}
                  THEN l.name->>'en'
                  ELSE l.name::text
                END
              ELSE NULL
            END as library_name
          FROM cases c
          LEFT JOIN libraries l ON l.id = c.library_id
          WHERE c.id = #{@case.id}
        ),
        counts AS (
          SELECT
            COALESCE((SELECT COUNT(DISTINCT id) FROM edgenotes WHERE case_id = #{@case.id}), 0) as edgenotes_count,
            COALESCE((SELECT COUNT(DISTINCT id) FROM cards WHERE case_id = #{@case.id}), 0) as cards_count,
            COALESCE((SELECT COUNT(DISTINCT id) FROM case_elements WHERE case_id = #{@case.id}), 0) as case_elements_count,#{'                                                                                                                 '}
            COALESCE((SELECT COUNT(DISTINCT element_id) FROM case_elements WHERE case_id = #{@case.id} AND element_type = 'Page'), 0) as pages_count,#{'                                                                                       '}
            COALESCE((SELECT COUNT(DISTINCT element_id) FROM case_elements WHERE case_id = #{@case.id} AND element_type = 'Podcast'), 0) as podcasts_count,#{'                                                                                 '}
            COALESCE((SELECT COUNT(DISTINCT id) FROM wikidata_links WHERE record_type = 'Case' AND record_id = #{@case.id}), 0) as wikidata_links_count,#{'                                                                                    '}
            COALESCE((SELECT COUNT(DISTINCT id) FROM deployments WHERE case_id = #{@case.id}), 0) as deployments_count,
            COALESCE((SELECT COUNT(DISTINCT id) FROM enrollments WHERE case_id = #{@case.id}), 0) as enrollments_count
        ),
        authors AS (
          SELECT string_agg(DISTINCT COALESCE(r.name, r.email), ', ') as authors_names
          FROM editorships e
          JOIN readers r ON r.id = e.editor_id
          WHERE e.case_id = #{@case.id}
        ),
        managers AS (
          SELECT string_agg(DISTINCT COALESCE(r.name, r.email), ', ') as managers_names
          FROM managerships m
          JOIN readers r ON r.id = m.manager_id
          JOIN cases c ON c.library_id = m.library_id
          WHERE c.id = #{@case.id}
        ),
        locales AS (
          SELECT string_agg(DISTINCT c2.locale, ', ') as locales
          FROM cases c1
          JOIN cases c2 ON (c2.translation_base_id = c1.translation_base_id OR c2.id = c1.translation_base_id)
          WHERE c1.id = #{@case.id}#{' '}
            AND c2.locale IS NOT NULL#{' '}
            AND c2.locale != c1.locale
        )
        SELECT#{' '}
          cd.case_id,
          cd.case_slug,
          cd.case_published_at,
          cd.library_name,
          co.edgenotes_count,
          co.cards_count,
          co.case_elements_count,
          co.pages_count,
          co.podcasts_count,
          co.wikidata_links_count,
          co.deployments_count,
          co.enrollments_count,
          COALESCE(a.authors_names, '') as authors_names,
          COALESCE(m.managers_names, '') as managers_names,
          COALESCE(l.locales, '') as locales
        FROM case_data cd
        CROSS JOIN counts co
        LEFT JOIN authors a ON true
        LEFT JOIN managers m ON true
        LEFT JOIN locales l ON true
      SQL

      result = ActiveRecord::Base.connection.exec_query(sql).first

      return {} unless result

      {
        'case_id' => result['case_id'],
        'case_slug' => result['case_slug'],
        'case_published_at' => result['case_published_at'],
        'library_name' => result['library_name'],
        'edgenotes_count' => result['edgenotes_count'] || 0,
        'cards_count' => result['cards_count'] || 0,
        'case_elements_count' => result['case_elements_count'] || 0,
        'pages_count' => result['pages_count'] || 0,
        'podcasts_count' => result['podcasts_count'] || 0,
        'wikidata_links_count' => result['wikidata_links_count'] || 0,
        'deployments_count' => result['deployments_count'] || 0,
        'enrollments_count' => result['enrollments_count'] || 0,
        'authors_names' => result['authors_names'] || '',
        'managers_names' => result['managers_names'] || '',
        'locales' => result['locales'] || ''
      }
    rescue StandardError => e
      Rails.logger.error "Error in associations query: #{e.message}"
      { error: e.class.name, message: e.message }
    end

    def events(date_range)
      # Build date filter for ahoy events
      ahoy_date_conditions = []
      ahoy_date_conditions << "ahoy_events.time >= '#{date_range[:from]}'" if date_range[:from]
      ahoy_date_conditions << "ahoy_events.time < '#{date_range[:to]}'" if date_range[:to]
      date_filter = ahoy_date_conditions.any? ? "AND #{ahoy_date_conditions.join(' AND ')}" : ''

      sql = <<~SQL
        WITH ahoy_events_by_locale AS (
          SELECT
            readers.locale,
            #{AHOY_EVENT_NAMES.map do |name|
              "COALESCE(SUM(CASE WHEN ahoy_events.name = '#{name}' THEN 1 ELSE 0 END), 0) AS #{name}_count"
            end.join(', ')},
            string_agg(DISTINCT COALESCE(visits.country, ''), ' ') AS countries
          FROM ahoy_events
          LEFT JOIN visits ON visits.id = ahoy_events.visit_id
          LEFT JOIN readers ON readers.id = ahoy_events.user_id
          WHERE ahoy_events.properties->>'case_slug' = '#{@case.slug}'
            AND readers.locale IS NOT NULL
            #{date_filter}
          GROUP BY readers.locale
        ),
        comment_counts AS (
          SELECT#{' '}
            r.locale,
            COUNT(*) as write_comment_count
          FROM comments c
          JOIN readers r ON r.id = c.reader_id
          JOIN comment_threads ct ON ct.id = c.comment_thread_id
          JOIN forums f ON f.id = ct.forum_id
          WHERE f.case_id = #{@case.id}
            AND r.locale IS NOT NULL
            #{date_range[:from] ? "AND c.created_at >= '#{date_range[:from]}'" : ''}
            #{date_range[:to] ? "AND c.created_at < '#{date_range[:to]}'" : ''}
          GROUP BY r.locale
        ),
        comment_thread_counts AS (
          SELECT#{' '}
            r.locale,
            COUNT(*) as write_comment_thread_count
          FROM comment_threads ct
          JOIN readers r ON r.id = ct.reader_id
          JOIN forums f ON f.id = ct.forum_id
          WHERE f.case_id = #{@case.id}
            AND r.locale IS NOT NULL
            #{date_range[:from] ? "AND ct.created_at >= '#{date_range[:from]}'" : ''}
            #{date_range[:to] ? "AND ct.created_at < '#{date_range[:to]}'" : ''}
          GROUP BY r.locale
        ),
        submission_counts AS (
          SELECT#{' '}
            r.locale,
            COUNT(*) as write_quiz_submission_count
          FROM submissions s
          JOIN readers r ON r.id = s.reader_id
          JOIN quizzes q ON q.id = s.quiz_id
          WHERE q.case_id = #{@case.id}
            AND r.locale IS NOT NULL
            #{date_range[:from] ? "AND s.created_at >= '#{date_range[:from]}'" : ''}
            #{date_range[:to] ? "AND s.created_at < '#{date_range[:to]}'" : ''}
          GROUP BY r.locale
        ),
        all_locales AS (
          SELECT locale FROM ahoy_events_by_locale
          UNION
          SELECT locale FROM comment_counts
          UNION
          SELECT locale FROM comment_thread_counts
          UNION
          SELECT locale FROM submission_counts
        )
        SELECT#{' '}
          al.locale,
          COALESCE(ae.countries, '') as countries,
          #{AHOY_EVENT_NAMES.map { |name| "COALESCE(ae.#{name}_count, 0) as #{name}" }.join(', ')},
          COALESCE(cc.write_comment_count, 0) as write_comment,
          COALESCE(ctc.write_comment_thread_count, 0) as write_comment_thread,
          COALESCE(sc.write_quiz_submission_count, 0) as write_quiz_submission,
          COALESCE(sc.write_quiz_submission_count, 0) as read_quiz
        FROM all_locales al
        LEFT JOIN ahoy_events_by_locale ae ON ae.locale = al.locale
        LEFT JOIN comment_counts cc ON cc.locale = al.locale
        LEFT JOIN comment_thread_counts ctc ON ctc.locale = al.locale
        LEFT JOIN submission_counts sc ON sc.locale = al.locale
        ORDER BY al.locale
      SQL

      # Execute the main query
      results = ActiveRecord::Base.connection.exec_query(sql)

      results.map do |row|
        result = {
          'locale' => row['locale'],
          'countries' => row['countries'] || ''
        }

        # Add all event counts
        ALL_EVENT_NAMES.each do |event_name|
          result[event_name] = (row[event_name] || 0).to_i
        end

        result
      end
    rescue StandardError => e
      Rails.logger.error "Error in events query: #{e.message}"
      []
    end
  end
end
