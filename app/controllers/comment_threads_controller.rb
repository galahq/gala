# frozen_string_literal: true

class CommentThreadsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_case, only: [:index]
  before_action :set_card, only: [:create]
  before_action :set_comment_thread, only: %i[show destroy]

  # GET /cases/case-slug/comment_threads
  def index
    @forum = current_reader.active_community.forums.find_by(case: @case)
    @comment_threads = if @forum.nil?
                         CommentThread.none
                       else
                         @forum.comment_threads
                               .visible_to_reader?(current_reader)
                               .order(:block_index, :start)
                               .includes(:card, comments: [:reader])
                       end
  end

  # POST /cards/1/comment_threads
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

  # GET /comment_threads/1
  #
  # This is the permalink to a comment thread that is sent to to the user in a
  # notification email. The comment thread is actually presented in a view of
  # the case react app.
  def show
    current_reader.update active_community_id: @comment_thread.forum
                                                              .community.id
    redirect_to conversation_comment_thread_url @comment_thread
  end

  # DELETE /comment_threads/1
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
    current_reader.active_community.forums.find_by case: @card.case
  end

  def comment_thread_params
    params.require(:comment_thread)
          .permit(:start, :length, :block_index, :original_highlight_text)
  end

  def conversation_comment_thread_url(comment_thread)
    "#{case_url(I18n.locale, comment_thread.card.case.slug)}" \
      "/conversation/#{comment_thread.id}"
  end
end
