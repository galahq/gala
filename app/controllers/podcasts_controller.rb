# frozen_string_literal: true

# @see Podcast
class PodcastsController < ApplicationController
  include BroadcastEdits

  before_action :authenticate_reader!
  before_action :set_podcast, only: %i[show update destroy]
  before_action :set_case, only: [:create]

  broadcast_edits to: :@podcast

  # @route [POST] `/cases/case-slug/podcasts`
  def create
    @podcast = Podcast.new podcast_params
    @podcast.build_case_element case: @case

    authorize @podcast

    if @podcast.save
      render @podcast.decorate
    else
      render json: @podcast.errors, status: :unprocessable_entity
    end
  end

  # @route [PATCH/PUT] `/podcasts/1`
  def update
    authorize @podcast

    if @podcast.update(podcast_params)
      render @podcast.decorate
    else
      render json: @podcast.errors, status: :unprocessable_entity
    end
  end

  # @route [DELETE] `/podcasts/1`
  def destroy
    authorize @podcast

    @podcast.destroy
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_podcast
    @podcast = Podcast.find(params[:id])
  end

  def set_case
    @case = Case.friendly.find(params[:case_slug])
  end

  # Only allow a trusted parameter "white list" through.
  def podcast_params
    params[:podcast].permit(:title, :audio, :description, :artwork,
                            :photo_credit,
                            credits_list: [hosts: [], guests: %i[name title]])
  end
end
