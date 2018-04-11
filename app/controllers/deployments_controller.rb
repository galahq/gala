# frozen_string_literal: true

# @see Deployment
class DeploymentsController < ApplicationController
  include SelectionParams

  before_action :set_deployment, only: %i[edit update]
  after_action :clear_content_item_selection_params, only: [:update]

  # @route [GET] `/deployments/1/edit`
  def edit
    authorize @deployment
    set_selection_params
    set_recommended_quizzes
  end

  # @route [PATCH/PUT] `/deployments/1`
  def update
    authorize @deployment

    result = customizer.customize(**customized_deployment_params)
    if result.errors.empty?
      render
    else
      render json: result.errors, status: :unprocessable_entity
    end
  end

  private

  def set_deployment
    @deployment = Deployment.find params[:id]
  end

  def set_recommended_quizzes
    reader = reader_signed_in? ? current_reader : nil
    recommended_quizzes = @deployment.case.quizzes.recommended
    custom_quizzes = @deployment.case.quizzes
                                .authored_by reader: reader, lti_uid: lti_uid

    @recommended_quizzes = [] + recommended_quizzes + custom_quizzes
  end

  def customizer
    author_id = current_reader.try :id
    CustomizeDeploymentService.new @deployment, author_id, lti_uid
  end

  def customized_deployment_params
    params.require(:deployment).permit(
      :answers_needed, :quiz_id,
      custom_questions: [:id, :content, :correct_answer, options: []]
    )
          .to_h
          .symbolize_keys
  end
end
