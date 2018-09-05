# frozen_string_literal: true

# Create a deployment from Canvas
class CanvasDeploymentsController < ApplicationController
  include SelectionParams

  skip_before_action :verify_authenticity_token
  before_action :ensure_content_item_selection_params_set!, only: [:create]

  # @route [POST] `/groups/1/canvas_deployments`
  def create
    the_group = Group.find params[:group_id]
    the_case = Case.friendly.find params[:case_slug]

    @deployment = Deployment.find_or_initialize_by(
      group: the_group, case: the_case
    ) do |d|
      d.answers_needed = 0
    end

    redirect_to edit_deployment_path @deployment if @deployment.save
  end
end
