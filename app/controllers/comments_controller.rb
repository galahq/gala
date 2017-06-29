# frozen_string_literal: true

class CommentsController < ApplicationController
  before_action :authenticate_reader!, only: %i[create update destroy]
  before_action :set_comment, only: %i[show update destroy]
  before_action :set_comment_thread, only: [:create]

  # GET /comments
  def index
    @comments = Comment.all

    render json: @comments
  end

  # GET /comments/1
  def show
    render partial: @comment
  end

  # POST /comments
  def create
    @comment = @comment_thread.comments.build(comment_params)
    @comment.reader = current_reader

    if @comment.save
      render partial: @comment
    else
      render json: @comment.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /comments/1
  def update
    authorize_action_for @comment
    if @comment.update(comment_params)
      render json: @comment
    else
      render json: @comment.errors, status: :unprocessable_entity
    end
  end

  # DELETE /comments/1
  def destroy
    authorize_action_for @comment
    @comment.destroy
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_comment
    @comment = Comment.find(params[:id])
  end

  def set_comment_thread
    @comment_thread = CommentThread.find(params[:comment_thread_id])
  end

  # Only allow a trusted parameter "white list" through.
  def comment_params
    params.require(:comment).permit(:content)
  end
end
