class CasesController < ApplicationController
  before_action :authenticate_reader!, except: %i(show)
  before_action :set_case, only: [:show, :edit, :update, :destroy]

  authorize_actions_for Case, except: %i(show)

  layout 'admin'

  # GET /cases
  def index
    @cases = Case.all.order :slug
  end

  # GET /cases/1
  def show
    authorize_action_for @case
    render layout: 'application'
  end

  def new
    @case = Case.new
  end

  # POST /cases
  def create
    @case = Case.new(case_params)
    @case.kicker ||= @case.slug.split('-').join(' ').titlecase
    @case.title ||= ""

    respond_to do |format|
      if @case.save
        format.html { redirect_to case_path(@case, anchor: "/edit") }
        format.json { render json: @case, status: :created, location: @case }
      else
        format.html { render :new }
        format.json { render json: @case.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /cases/1
  def update
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
      @case = Case.where(slug: params[:slug]).includes( :podcasts, :edgenotes, pages: [:cards], enrollments: [:reader] )
        .first
    end

    # Only allow a trusted parameter "white list" through.
    def case_params
      params.require(:case).permit(:published, :kicker, :title, :dek, :slug,
                                   :authors, :translators, :photo_credit,
                                   :summary, :tags, :cover_url)
    end
end
