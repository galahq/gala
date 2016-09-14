class PodcastsController < ApplicationController
  before_action :set_podcast, only: [:show, :update, :destroy]

  # GET /podcasts
  def index
    set_case
    @podcasts = @case.podcasts
  end

  # GET /podcasts/1
  def show
  end

  # POST /podcasts
  def create
    @podcast = Podcast.new(podcast_params)

    if @podcast.save
      render json: @podcast, status: :created, location: @podcast
    else
      render json: @podcast.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /podcasts/1
  def update
    if @podcast.update(podcast_params)
      render json: @podcast
    else
      render json: @podcast.errors, status: :unprocessable_entity
    end
  end

  # DELETE /podcasts/1
  def destroy
    @podcast.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_podcast
      set_case
      @podcast = Podcast.where("case": @case, position: params[:position])
    end

    def set_case
      @case = Case.find_by_slug(params[:case_slug])
    end

    # Only allow a trusted parameter "white list" through.
    def podcast_params
      params.require(:podcast).permit(:title_i18n, :audio_url_i18n, :description_i18n, :case_id)
    end
end
