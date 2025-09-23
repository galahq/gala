# frozen_string_literal: true

# @see Enrollment
class EnrollmentsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_enrollment, only: %i[create destroy]

  # @route [GET] `/enrollments`
  def index
    @enrollments = current_reader.enrollments
                                .includes(active_group: :community)

    respond_to do |format|
      format.html { redirect_to root_path }
      format.json { render json: @enrollments, each_serializer: EnrollmentSerializer }
    end
  end

  # @route [POST] `/cases/case-slug/enrollment`
  def create
    authorize @enrollment
    @enrollment.save!
    head :no_content
  end

  # @route [DELETE] `/cases/case-slug/enrollment`
  def destroy
    head :not_found && return unless @enrollment

    authorize @enrollment
    @enrollment.destroy
    head :no_content
  end

  private

  def set_enrollment
    kase = Case.friendly.find params[:case_slug]
    @enrollment = Enrollment.find_or_initialize_by case_id: kase.id,
                                                   reader_id: current_reader.id
  end
end
