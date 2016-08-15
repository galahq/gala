class EdgenotesController < ApplicationController
  before_action :set_edgenote, only: [:show, :update, :destroy]

  # GET /edgenotes
  def index
    @edgenotes = Edgenote.all

    render json: @edgenotes
  end

  # GET /edgenotes/1
  def show
  end

  # POST /edgenotes
  def create
    @edgenote = Edgenote.new(edgenote_params)

    if @edgenote.save
      render json: @edgenote, status: :created, location: @edgenote
    else
      render json: @edgenote.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /edgenotes/1
  def update
    if @edgenote.update(edgenote_params)
      render json: @edgenote
    else
      render json: @edgenote.errors, status: :unprocessable_entity
    end
  end

  # DELETE /edgenotes/1
  def destroy
    @edgenote.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_edgenote
      @edgenote = Edgenote.find_by_slug params[:slug]
    end

    # Only allow a trusted parameter "white list" through.
    def edgenote_params
      params.require(:edgenote).permit(:caption_i18n, :format, :thumb, :content_i18n)
    end
end
