# frozen_string_literal: true

# @see Deployment
class DeploymentsController < ApplicationController
  include SelectionParams

  before_action :authenticate_reader!, only: %i[new create]
  before_action :set_deployments, only: %i[index new create]
  before_action :set_deployment, only: %i[edit update]
  after_action :clear_content_item_selection_params, only: [:edit]

  layout 'admin'

  decorates_assigned :deployments, with: DeploymentsDecorator

  def index; end

  def new
    @deployment ||= Deployment.new case: selected_case
    prepare_for_form
  end

  def create
    service = DeployCaseService.new deployment_params, current_reader
    @deployment = service.call

    if @deployment.persisted?
      redirect_to helpers.focus_deployment_path(@deployment),
                  notice: successfully_created
    else
      prepare_for_form
      render :new
    end
  end

  # @route [GET] `/deployments/1/edit`
  def edit
    authorize @deployment
    set_selection_params
    set_recommended_quizzes
    render layout: 'embed' if selection_params.present?
  end

  # @route [PATCH/PUT] `/deployments/1`
  def update
    authorize @deployment

    result = customizer.customize(**customized_deployment_params)
    if result.errors.empty?
      render json: { redirect: helpers.focus_deployment_quiz_path(@deployment) }
    else
      render json: result.errors, status: :unprocessable_entity
    end
  end

  private

  def set_deployments
    @deployments =
      DeploymentPolicy::AdminScope
      .new(current_user, Deployment)
      .resolve
      .yield_self do |scope|
        selected_case ? scope.where(case: selected_case) : scope
      end
  end

  def set_deployment
    @deployment = Deployment.find params[:id]
  end

  def prepare_for_form
    @deployment.build_group if @deployment.group.blank?
    @case = @deployment.case.decorate
  end

  def selected_case
    Case.friendly.find params[:case_slug]
  rescue ActiveRecord::RecordNotFound
    nil
  end

  def deployment_params
    params.require(:deployment)
          .permit(:case_id, :group_id, group_attributes: %i[name])
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
