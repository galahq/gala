# frozen_string_literal: true

class CasesController < ApplicationController
  before_action :authenticate_reader!, except: %i[index show]
  before_action :set_case, only: %i[show edit update destroy]

  authorize_actions_for Case, except: %i[index show]

  layout 'admin'

  # GET /cases
  def index
    @cases = Case.all.includes(:case_elements)
  end

  # GET /cases/1
  def show
    authenticate_reader! unless @case.published
    authorize_action_for @case

    set_group_and_deployment

    render layout: 'with_header'
  end

  def new
    @case = Case.new
  end

  # POST /cases
  def create
    @case = Case.new(case_params)
    @case.kicker ||= @case.slug.split('-').join(' ').titlecase
    @case.title ||= ''

    respond_to do |format|
      if @case.save
        format.html { redirect_to case_path(@case, anchor: '/edit') }
        format.json { render json: @case, status: :created, location: @case }
      else
        format.html { render :new }
        format.json { render json: @case.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /cases/1
  def update
    set_group_and_deployment

    if @case.update(case_params)
      render :show, status: :ok, location: @case
    else
      render json: @case.errors, status: :unprocessable_entity
    end
  end

  # DELETE /cases/1
  def destroy
    @case.destroy
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_case
    slug = params[:slug] || params[:case_slug]
    @case = Case.where(slug: slug).includes(
      :podcasts,
      :edgenotes,
      activities: %i[case_element card],
      pages: %i[case_element cards],
      cards: [comment_threads: [:reader, comments: [:reader]]],
      enrollments: [:reader]
    ).first
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
      :summary, :tags, :cover_url, :latitude, :longitude, :zoom,
      authors: [], translators: [], learning_objectives: []
    )
  end
end
