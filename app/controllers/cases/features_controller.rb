# frozen_string_literal: true

module Cases
  # Featured cases appear prominently in the catalog.
  class FeaturesController < ApplicationController
    before_action :set_case, only: %i[create destroy]

    # @route [GET] `/cases/features`
    def index
      enrolled = current_user.enrollments.pluck(:case_id)
      features = Case.where.not(id: enrolled)
                     .ordered
                     .limit(6)
                     .map(&:slug)
      render json: { features: features }
    end

    # @route [POST] `/cases/features`
    def create
      @case.update featured: true
      redirect_to edit_case_settings_path @case
    end

    # @route [DELETE] `/cases/features/case-slug`
    def destroy
      @case.update featured: false
      redirect_to edit_case_settings_path @case
    end

    private

    def set_case
      return head :bad_request if params[:case_slug].blank?
      @case = Case.friendly.find params[:case_slug]
    end
  end
end
