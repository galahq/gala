class CommentThreadsController < ApplicationController
  before_action :set_comment_thread, only: [:show, :update, :destroy]

  # GET /comment_threads
  def index
    @comment_threads = CommentThread.all

    render json: @comment_threads
  end

  # GET /comment_threads/1
  def show
    render json: @comment_thread
  end

  # POST /comment_threads
  def create
    @comment_thread = CommentThread.new(comment_thread_params)

    if @comment_thread.save
      render json: @comment_thread, status: :created, location: @comment_thread
    else
      render json: @comment_thread.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /comment_threads/1
  def update
    if @comment_thread.update(comment_thread_params)
      render json: @comment_thread
    else
      render json: @comment_thread.errors, status: :unprocessable_entity
    end
  end

  # DELETE /comment_threads/1
  def destroy
    @comment_thread.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_comment_thread
      @comment_thread = CommentThread.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def comment_thread_params
      params.require(:comment_thread).permit(:group_id, :case_id)
    end
end
