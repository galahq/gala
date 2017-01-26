class EdgenotesController < ApplicationController
  before_action :set_edgenote, only: [:show, :update, :destroy]
  before_action :set_case, only: [:create]
  before_action :set_cors_headers, only: [:show]

  authorize_actions_for Edgenote, except: %i(show)

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
    @edgenote = @case.edgenotes.build(
      slug: params[:slug],
      format: 'aside',
      style: :v2
    )

    if @edgenote.save
      render partial: 'edgenote', locals: {edgenote: @edgenote}
    else
      render json: @edgenote.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /edgenotes/1
  def update
    if @edgenote.update(edgenote_params)
      render partial: 'edgenote', locals: {edgenote: @edgenote}
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
      @edgenote = Edgenote.where(slug: params[:slug]).includes( case: [:podcasts, :edgenotes, pages:[:cards], enrollments: [:reader]] )
        .first
    end

    def set_case
      @case = Case.where(slug: params[:case_slug])
        .first
    end

    # Only allow a trusted parameter "white list" through.
    def edgenote_params
      params.require(:edgenote).permit(*%i(
        caption format thumbnail_url content embed_code website_url image_url
        pdf_url instructions photo_credit slug style pull_quote attribution
        call_to_action audio_url youtube_slug statistics
      ))

    end

    def set_cors_headers
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, PUT, DELETE, GET, OPTIONS'
      headers['Access-Control-Request-Method'] = '*'
      headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    end
end
