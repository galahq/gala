class StatisticsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_trackable

  authorize_actions_for Case, all_actions: :update

  def show
    render partial: 'trackable/statistics', locals: { trackable: @trackable }
  end

  private
  def set_trackable
    @trackable = Card.find(params[:card_id])
    @trackable ||= Podcast.find(params[:podcast_id])
    @trackable ||= Edgenote.find(params[:edgenote_id])
  end
end
