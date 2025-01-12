# frozen_string_literal: true

# @see Case
class CasesController < ApplicationController
  include BroadcastEdits
  include SelectionParams
  include VerifyLock

  CASE_EAGER_LOADING_CONFIG = [
    :cards,
    podcasts: [
      :card, :case_element,
      audio_attachment: :blob,
      artwork_attachment: :blob
    ],
    edgenotes: [
      image_attachment: :blob,
      audio_attachment: :blob,
      file_attachment: :blob
    ],
    pages: %i[case_element cards]
  ].freeze

  before_action :authenticate_reader!, except: %i[index show]
  before_action :validate_react_router_location,
                only: %i[show],
                if: -> { params[:react_router_location].present? }
  before_action :set_case, only: %i[show edit update destroy]
  before_action -> { verify_lock_on @case }, only: %i[update destroy]

  broadcast_edits to: :@case

  layout 'admin'

  # @route [GET] `/cases`
  def index
    @cases = policy_scope(Case)
             .ordered
             .with_attached_cover_image
             .includes(:library, :tags)
             .decorate

    render json: @cases, each_serializer: Cases::PreviewSerializer
  end

  # @route [GET] `/cases/slug`
  def show
    authenticate_reader! unless @case.published
    authorize @case
    set_group_and_deployment
    respond_to do |format|
      format.html { render layout: 'with_header' }
      format.json do
        render json: @case, serializer: Cases::ShowSerializer,
               deployment: @deployment, enrollment: @enrollment
      end
    end
  end

  # @route [POST] `/cases`
  def create
    @case = current_reader.my_cases.build create_case_params
    if @case.save
      redirect_to edit_case_path(@case), notice: successfully_created
    else
      @case.errors.delete(:slug)
      render :new
    end
  end

  # @route [GET] `/cases/slug/edit`
  def edit
    authorize @case
    redirect_to case_path @case, edit: true
  end

  # @route [PATCH/PUT] `/cases/slug`
  def update
    authorize @case
    set_group_and_deployment
    if @case.update(update_case_params)
      render json: @case, serializer: Cases::ShowSerializer,
             deployment: @deployment, enrollment: @enrollment
    else
      render json: @case.errors, status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/cases/slug`
  def destroy
    redirect_to case_confirm_deletion_path @case and return
    authorize @case
    @case.destroy!
    redirect_to my_cases_path, notice: successfully_destroyed
  end

  def copy
    current_case = case_for_copy(params[:id])
    CaseCloneJob.perform_later current_case, locale: current_case.locale
    redirect_to my_cases_path, notice: successfully_copied
  end

  private

  # Validates the case path.
  #
  # Example:
  # * Valid URL: /cases/valid-case/1
  # * Invalid URL: /cases/valid-case/1/3/2/11/6/4/3/2/13/15
  def validate_react_router_location
    redirect_to '/404' if params[:react_router_location].split('/').size > 1
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_case
    @case = Case.friendly.includes(*CASE_EAGER_LOADING_CONFIG)
                .find(slug).decorate
  end

  def case_for_copy(id)
          Case.friendly.find id
  end

  def slug
    params[:slug] || params[:case_slug]
  end

  def set_group_and_deployment
    @enrollment = current_user.enrollment_for_case @case
    @group = @enrollment.try(:active_group) || GlobalGroup.new
    @deployment = @group.deployment_for_case @case
  end

  # Only allow a trusted parameter "white list" through.
  def create_case_params
    params.require(:case).permit(:locale)
  end

  def update_case_params
    params.require(:case).permit(
      :published, :kicker, :title, :dek, :photo_credit, :summary, :tags,
      :cover_image, :teaching_guide, :latitude, :longitude, :zoom,
      :acknowledgements,
      authors: %i[name institution], translators: [], learning_objectives: []
    )
  end
end
