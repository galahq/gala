# frozen_string_literal: true

# @see LinkedResource
class LinkedResourcesController < ApplicationController
  include BroadcastEdits
  include VerifyLock

  before_action :authenticate_reader!
  before_action :set_case
  before_action -> { verify_lock_on @case }
  before_action -> { authorize @case, :update? }
  before_action :set_linked_resource, only: %i[update destroy]

  broadcast_edits to: :@case, type: :update

  # @route [POST] `/cases/case-slug/linked_resources`
  def create
    linked_resource = @case.linked_resources.build linked_resource_params
    save_and_render linked_resource, status: :created
  end

  # @route [PUT] `/cases/case-slug/linked_resources/id`
  def update
    @linked_resource.assign_attributes linked_resource_params
    save_and_render @linked_resource, status: :ok
  end

  # @route [DELETE] `/cases/case-slug/linked_resources/id`
  def destroy
    @linked_resource.destroy
    head :no_content
  end

  private

  def save_and_render(linked_resource, status:)
    if linked_resource.save
      render json: linked_resource, status: status
    else
      render json: linked_resource.errors, status: :unprocessable_entity
    end
  end

  def linked_resource_params
    params.require(:linked_resource).permit(
      :name, :connection, :connection_other, :description, :position,
      identifiers: %i[type value]
    )
  end

  def set_case
    @case = Case.friendly.find params[:case_slug]
  end

  def set_linked_resource
    @linked_resource = @case.linked_resources.find params[:id]
  end
end
