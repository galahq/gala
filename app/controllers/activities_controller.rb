# frozen_string_literal: true

# @see Activity
class ActivitiesController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_activity, only: %i[show update destroy]
  before_action :set_case, only: [:create]

  # @route [POST] `/cases/case-slug/activities`
  def create
    authorize @case, :update?

    @activity = Activity.new activity_params
    @activity.build_case_element case: @case

    if @activity.save
      render @activity.decorate
    else
      render json: @activity.errors, status: :unprocessable_entity
    end
  end

  # @route [PATCH/PUT] `/activities/1`
  def update
    authorize @activity.case

    if @activity.update(activity_params)
      render @activity.decorate
    else
      render json: @activity.errors, status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/activities/1`
  def destroy
    authorize @activity.case

    @activity.destroy
  end

  private

  def set_case
    @case = Case.friendly.find params[:case_slug]
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_activity
    @activity = Activity.find(params[:id])
  end

  # Only allow a trusted parameter "white list" through.
  def activity_params
    params[:activity].permit(:title, :description, :pdf, :case_id)
  end
end
