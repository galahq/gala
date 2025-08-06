# frozen_string_literal: true

module Cases
  # The stats for a {Case} include its slug, what library it is in, etc.
  class StatsController < ApplicationController
    before_action :authenticate_reader!

    layout 'admin'

    # @param [GET] /cases/case-slug/stats
    def show
      set_case
      set_libraries
      set_editorships
      set_group_and_deployment
      
      respond_to do |format|
        format.html
        format.json do
          render json: {
            caseCreatedAt: @case.created_at,
            deployments: {
              allTime: @case.deployments.size,
              customRange: get_deployments_count
            },
            visits: {
              allTime: get_visits_count,
              customRange: get_visits_count_with_range
            },
            locales: {
              allTime: get_locales_string,
              customRange: get_locales_string_with_range
            },
            podcasts: get_podcasts_data
          }
        end
      end
    end

    # @param [PATCH/PUT] /cases/case-slug/stats
    def update
      set_case
      
      render json: {
        caseCreatedAt: @case.created_at,
        deployments: {
          allTime: @case.deployments.size,
          customRange: get_deployments_count
        },
        visits: {
          allTime: get_visits_count,
          customRange: get_visits_count_with_range
        },
        locales: {
          allTime: get_locales_string,
          customRange: get_locales_string_with_range
        },
        podcasts: get_podcasts_data
      }
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

    def get_deployments_count
      if date_range_params[:start_date] && date_range_params[:end_date]
        start_date = Date.parse(date_range_params[:start_date])
        end_date = Date.parse(date_range_params[:end_date])
        @case.deployments.where(created_at: start_date.beginning_of_day..end_date.end_of_day).size
      else
        @case.deployments.size
      end
    end

    def get_visits_count
      @case.events.interesting.where_properties(name: 'visit_element').group(:user_id).count.keys.count
    end

    def get_visits_count_with_range
      if date_range_params[:start_date] && date_range_params[:end_date]
        start_date = Date.parse(date_range_params[:start_date])
        end_date = Date.parse(date_range_params[:end_date])
        @case.events.interesting.where_properties(name: 'visit_element')
             .where(time: start_date.beginning_of_day..end_date.end_of_day)
             .group(:user_id).count.keys.count
      else
        get_visits_count
      end
    end

    def get_locales_string
      user_ids = @case.events.interesting.where_properties(name: 'visit_element').group(:user_id).count.keys
      Reader.where(id: user_ids).pluck(:locale).compact.uniq.to_sentence
    end

    def get_locales_string_with_range
      if date_range_params[:start_date] && date_range_params[:end_date]
        start_date = Date.parse(date_range_params[:start_date])
        end_date = Date.parse(date_range_params[:end_date])
        user_ids = @case.events.interesting.where_properties(name: 'visit_element')
                       .where(time: start_date.beginning_of_day..end_date.end_of_day)
                       .group(:user_id).count.keys
        Reader.where(id: user_ids).pluck(:locale).compact.uniq.to_sentence
      else
        get_locales_string
      end
    end

    def get_podcasts_data
      @case.podcasts.map do |podcast|
        podcast_listen_events = Ahoy::Event.interesting.where_properties(podcast_id: podcast.id)
        
        {
          id: podcast.id,
          title: podcast.title,
          listens: {
            allTime: podcast_listen_events.size,
            customRange: if date_range_params[:start_date] && date_range_params[:end_date]
                          start_date = Date.parse(date_range_params[:start_date])
                          end_date = Date.parse(date_range_params[:end_date])
                          podcast_listen_events.where(time: start_date.beginning_of_day..end_date.end_of_day).size
                        else
                          podcast_listen_events.size
                        end
          }
        }
      end
    end

    def date_range_params
      params.permit(:start_date, :end_date)
    end
  end
end
