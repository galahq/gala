# frozen_string_literal: true

# @see Case
class CasesController < ApplicationController
  before_action :authenticate_reader!, except: %i[index show]
  before_action :set_case, only: %i[show edit update destroy]

  layout 'admin'

  # @route [GET] `/cases`
  def index
    @cases = Case.all
                 .ordered
                 .with_attached_cover_image
                 .includes(:case_elements, :library)
                 .decorate
  end

  # @route [GET] `/cases/slug`
  def show
    authenticate_reader! unless @case.published
    authorize @case

    set_group_and_deployment

    render layout: 'with_header'
  end

  # @route [POST] `/cases`
  def create
    @case = current_reader.my_cases.build
    authorize @case

    if @case.save
      redirect_to edit_case_path(@case), notice: t('.created')
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
      render :show, status: :ok, location: @case
    else
      render json: @case.errors, status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/cases/slug`
  def destroy
    authorize @case
    @case.destroy
    redirect_to my_cases_path, notice: t('.deleted')
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_case
    @case = Case.friendly
                .includes(
                  :podcasts, :edgenotes,
                  activities: %i[case_element card],
                  pages: %i[case_element cards],
                  cards: [comment_threads: [:reader, comments: [:reader]]],
                  enrollments: [:reader]
                )
                .find(slug)
                .decorate
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
      :published, :featured, :kicker, :title, :dek, :slug, :photo_credit,
      :summary, :tags, :cover_image, :latitude, :longitude, :zoom,
      :acknowledgements, :library_id,
      authors: %i[name institution], translators: [], learning_objectives: []
    )
  end
end
