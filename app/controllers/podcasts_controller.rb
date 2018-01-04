# frozen_string_literal: true

class PodcastsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_podcast, only: %i[show update destroy]
  before_action :set_case, only: [:create]

  authorize_actions_for Podcast

  # POST /cases/case-slug/podcasts
  def create
    @podcast = Podcast.create_as_element @case, title: 'New podcast'

    if @podcast.persisted?
      render @podcast
    else
      render json: @podcast.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /podcasts/1
  def update
    if @podcast.update(podcast_params)
      render @podcast
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
    @podcast = Podcast.find(params[:id])
  end

  def set_case
    @case = Case.find_by_slug(params[:case_slug])
  end

  # Only allow a trusted parameter "white list" through.
  def podcast_params
    params.require(:podcast).permit(:title, :audio_url, :description,
                                    :case_id, :artwork_url, :photo_credit,
                                    credits_list: [hosts: [], guests: %i[name title]])
  end
end
