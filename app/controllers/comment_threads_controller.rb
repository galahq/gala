# frozen_string_literal: true

# @see CommentThread
class CommentThreadsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_case, only: %i[index create]
  before_action :set_card, only: [:create]
  before_action :set_comment_thread, only: %i[show destroy]

  # @route [GET] `/cases/case-slug/comment_threads`
  def index
    @forum = current_reader.active_community.forums.find_by(case: @case)
    @comment_threads = CommentThread.none if @forum.nil?
    @comment_threads ||=
      @forum.comment_threads
            .visible_to_reader(current_reader)
            .includes(:card, comments: [:reader, attachments_attachments: :blob])

    render json: @comment_threads, serializer: CommentThreads::IndexSerializer, root: '',
           case: @case, forum: @forum
  end

  # @route [POST] `/cards/1/comment_threads`
  # @route [POST] `/cases/case-slug/comment_threads`
  #
  # A CommentThread can live either on a Card, in which case its range is
  # calculated by searching the card text for the
  # `CommentThread#original_highlight_text`, or it can be “unattached,” living
  # only on a Case.
  def create
    build_comment_thread
    @comment_thread.reader = current_reader
    @comment_thread.forum = active_forum
    @comment_thread.locale = I18n.locale

    if @comment_thread.save
      render json: @comment_thread
    else
      render json: @comment_thread.errors, status: :unprocessable_entity
    end
  end

  # @route [GET] `/comment_threads/1`
  #
  # This is the permalink to a comment thread that is sent to to the user in a
  # notification email. The comment thread is actually presented in a view of
  # the case react app.
  def show
    current_reader.update active_community_id: @comment_thread.forum
                                                              .community.id
    redirect_to conversation_comment_thread_url @comment_thread
  end

  # @route [DELETE] `/comment_threads/1`
  def destroy
    authorize @comment_thread
    @comment_thread.destroy
  end

  private

  def build_comment_thread
    relation = (@card || @case)
    return head :unprocessable_entity if relation.nil?

    @comment_thread = relation.comment_threads.build(comment_thread_params)
  end

  def set_comment_thread
    @comment_thread = CommentThread.find params[:id]
  end

  def set_case
    @case = Case.friendly.find params[:case_slug] if params[:case_slug]
  end

  def set_card
    @card = Card.find params[:card_id] if params[:card_id]
  end

  def active_forum
    kase = @case || @card.case
    current_reader.active_community.forums.find_by case: kase
  end

  def comment_thread_params
    params[:comment_thread]
      .permit(:start, :length, :block_index, :original_highlight_text)
  end

  def conversation_comment_thread_url(comment_thread)
    "#{case_url(comment_thread.forum.case.slug)}" \
      "/conversation/#{comment_thread.id}"
  end
end
