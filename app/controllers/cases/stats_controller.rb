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
          render json: get_case_stats
        end
      end
    end

    # @param [PATCH/PUT] /cases/case-slug/stats
    def update
      set_case
      
      render json: get_case_stats
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

    def get_case_stats
      CaseStatsService.new(@case, date_range_params).call
    end

    def date_range_params
      params.permit(:start_date, :end_date)
    end
  end
end
