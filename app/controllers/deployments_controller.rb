# frozen_string_literal: true

# @see Deployment
class DeploymentsController < ApplicationController
  include SelectionParams

  before_action :authenticate_reader!, only: %i[index show new create destroy]
  before_action :set_deployments, only: %i[index new create]
  before_action :set_deployment, only: %i[show edit update destroy]
  after_action :clear_content_item_selection_params, only: %i[update]

  layout 'admin'

  decorates_assigned :deployments, with: DeploymentsDecorator
  decorates_assigned :deployment

  # @route [GET] `/deployments`
  def index; end

  # @route [GET] `/deployments/1`
  def show
    authorize @deployment
    @progressions = Kaminari.paginate_array(@deployment.reader_progressions)
                            .page(params[:page]).per(10)
  end

  # @route [GET] `/deployments/new`
  def new
    @deployment ||= Deployment.new case: selected_case
    prepare_for_form
  end

  # @route [POST] `/deployments`
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
    set_suggested_quizzes
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

  def destroy
    authorize @deployment
    if @deployment.destroy
      redirect_to deployments_url, notice: 'Successfully deleted deployment'
    else
      redirect_to deployments_url, alert: 'Failed to delete deployment'
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
    if params.key? :case_slug
      Case.friendly.find(params[:case_slug])
    elsif params.key? :deployment
      Case.find(params.dig(:deployment, :case_id))
    end
  rescue ActiveRecord::RecordNotFound
    nil
  end

  def deployment_params
    params.require(:deployment)
          .permit(:case_id, :group_id, group_attributes: %i[name])
  end

  def set_suggested_quizzes
    reader = reader_signed_in? ? current_reader : nil
    suggested_quizzes = @deployment.case.quizzes.suggested
    custom_quizzes = @deployment.case.quizzes
                                .authored_by reader: reader, lti_uid: lti_uid

    @suggested_quizzes = [] + suggested_quizzes + custom_quizzes
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
