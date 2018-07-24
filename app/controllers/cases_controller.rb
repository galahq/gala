# frozen_string_literal: true

# @see Case
class CasesController < ApplicationController
  include BroadcastEdits
  include VerifyLock

  before_action :authenticate_reader!, except: %i[index show]
  before_action :set_case, only: %i[show edit update destroy]
  before_action -> { verify_lock_on @case }, only: %i[update destroy]

  broadcast_edits to: :@case

  layout 'admin'

  # @route [GET] `/cases`
  def index
    @cases = policy_scope(Case)
             .ordered
             .with_attached_cover_image
             .includes(:case_elements, :library, :tags)
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
    @case = current_reader.my_cases.build

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

    if @case.update(case_params)
      render json: @case, serializer: Cases::ShowSerializer,
             deployment: @deployment, enrollment: @enrollment
    else
      render json: @case.errors, status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/cases/slug`
  def destroy
    authorize @case
    @case.destroy
    redirect_to my_cases_path, notice: successfully_destroyed
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_case
    @case = Case.friendly.includes(
      :podcasts, :cards,
      edgenotes: [image_attachment: :blob, audio_attachment: :blob],
      activities: %i[case_element card], pages: %i[case_element cards]
    )
                .find(slug).decorate
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
  def case_params
    params.require(:case).permit(
      :published, :kicker, :title, :dek, :photo_credit, :summary, :tags,
      :cover_image, :latitude, :longitude, :zoom, :acknowledgements,
      authors: %i[name institution], translators: [], learning_objectives: []
    )
  end
end
