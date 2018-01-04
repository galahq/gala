# frozen_string_literal: true

class StatisticsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_trackable

  authorize_actions_for Case, all_actions: :update

  # GET /#{trackable member path}/statistics
  def show
    render partial: 'trackable/statistics', locals: { trackable: @trackable }
  end

  private

  def set_trackable
    @trackable = params[:card_id] && Card.find(params[:card_id])
    @trackable ||= params[:podcast_id] && Podcast.find(params[:podcast_id])
    @trackable ||= params[:edgenote_slug] && Edgenote.find_by_slug(params[:edgenote_slug])
  end
end
