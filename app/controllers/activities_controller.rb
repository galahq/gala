# frozen_string_literal: true

class ActivitiesController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_activity, only: %i[show update destroy]
  before_action :set_case, only: [:create]

  authorize_actions_for Activity

  # GET /activities
  def index
    @activities = Activity.all

    render json: @activities
  end

  # GET /activities/1
  def show
    render json: @activity
  end

  # POST /activities
  def create
    @activity = Activity.create_as_element @case, title: 'New activity'

    if @activity.persisted?
      render @activity
    else
      render json: @activity.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /activities/1
  def update
    if @activity.update(activity_params)
      render @activity
    else
      render json: @activity.errors, status: :unprocessable_entity
    end
  end

  # DELETE /activities/1
  def destroy
    @activity.destroy
  end

  private

  def set_case
    @case = Case.find_by_slug params[:case_slug]
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_activity
    @activity = Activity.find(params[:id])
  end

  # Only allow a trusted parameter "white list" through.
  def activity_params
    params.require(:activity).permit(:title, :description, :pdf_url, :case_id)
  end
end
