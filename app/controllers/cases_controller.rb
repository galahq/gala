class CasesController < ApplicationController
  before_action :authenticate_reader!, only: %i(create update destroy)
  before_action :set_case, only: [:show, :update, :destroy]

  authorize_actions_for Case, except: %i(index show)

  # GET /cases
  def index
    @featured = Case.featured.sort
    @index = Case.in_index.sort_by &:title
    render layout: "window"
  end

  # GET /cases/1
  def show
    authorize_action_for @case
  end

  # POST /cases
  def create
    @case = Case.new(case_params)

    if @case.save
      render json: @case, status: :created, location: @case
    else
      render json: @case.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /cases/1
  def update
    if @case.update(case_params)
      render json: @case
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
      @case = Case.find_by_slug params[:slug]
    end

    # Only allow a trusted parameter "white list" through.
    def case_params
      params.require(:case).permit(:published, :title, :slug, :authors, :text, :summary, :tags)
    end
end
