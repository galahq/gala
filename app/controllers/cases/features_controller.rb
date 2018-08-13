# frozen_string_literal: true

module Cases
  # Featured cases appear prominently in the catalog.
  class FeaturesController < ApplicationController
    before_action :set_case, only: %i[create update destroy]
    before_action :authorize_user, only: %i[create update destroy]

    # @route [GET] `/cases/features`
    def index
      features = unenrolled_cases
                 .published
                 .with_locale_or_fallback(current_user.locale)
                 .ordered
                 .limit(6)
                 .pluck(:slug)

      render json: { features: features }
    end

    # @route [POST] `/cases/features`
    def create
      @case.update featured: true
      redirect_to edit_case_settings_path(@case), notice: successfully_updated
    end

    # @route [PUT/PATCH] `/cases/features/case-slug`
    def update
      @case.update featured_at: params.dig(:case, :featured_at)
      redirect_to edit_case_settings_path(@case), notice: successfully_updated
    end

    # @route [DELETE] `/cases/features/case-slug`
    def destroy
      @case.update featured: false
      redirect_to edit_case_settings_path(@case), notice: successfully_updated
    end

    private

    def set_case
      return head :bad_request if params[:case_slug].blank?
      @case = Case.friendly.find params[:case_slug]
    end

    def unenrolled_cases
      enrolled_translation_sets =
        Case.where(id: current_user.enrollments.pluck(:case_id))
            .pluck(:translation_base_id)

      Case.where.not(translation_base_id: enrolled_translation_sets)
    end

    def authorize_user
      authorize :'cases/feature'
    end
  end
end
