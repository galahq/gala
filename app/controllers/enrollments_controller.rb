# frozen_string_literal: true

class EnrollmentsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_enrollment, only: %i[create destroy]

  # GET /enrollments
  def index
    @enrollments = current_reader.enrollments

    respond_to do |format|
      format.html { redirect_to root_path }
      format.json
    end
  end

  # POST /cases/:case_slug/enrollment
  def create
    authorize_action_for @enrollment

    if @enrollment.save
      head :created
    else
      head :unprocessable_entity
    end
  end

  # DELETE /cases/:case_slug/enrollment
  def destroy
    head :no_content && return unless @enrollment

    authorize_action_for @enrollment
    @enrollment.destroy
  end

  private

  def set_enrollment
    kase = Case.find_by_slug params[:case_slug]
    @enrollment = Enrollment.find_or_initialize_by case_id: kase.id,
                                                   reader_id: current_reader.id
  end
end
