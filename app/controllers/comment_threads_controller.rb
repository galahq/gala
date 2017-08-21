# frozen_string_literal: true

class CommentThreadsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_case, only: [:index]
  before_action :set_card, only: [:create]
  before_action :set_comment_thread, only: %i[show destroy]

  def index
    @comment_threads = current_reader
                       .active_community
                       .forums
                       .find_by(case: @case)
                       .comment_threads
                       .visible_to_reader?(current_reader)
                       .order(:block_index, :start)
  end

  def create
    @comment_thread = @card.comment_threads.build(comment_thread_params)
    @comment_thread.reader = current_reader
    @comment_thread.forum = active_forum
    @comment_thread.locale = I18n.locale

    if @comment_thread.save
      render partial: @comment_thread
    else
      render json: @comment_thread.errors, status: :unprocessable_entity
    end
  end

  def show; end

  def destroy
    authorize_action_for @comment_thread
    @comment_thread.destroy
  end

  private

  def set_comment_thread
    @comment_thread = CommentThread.find params[:id]
  end

  def set_case
    @case = Case.find_by_slug params[:case_slug]
  end

  def set_card
    @card = Card.find params[:card_id]
  end

  def active_forum
    Forum.find_by case: @card.case, community: current_reader.active_community
  end

  def comment_thread_params
    params.require(:comment_thread).permit(:start, :length, :block_index, :original_highlight_text)
  end
end
