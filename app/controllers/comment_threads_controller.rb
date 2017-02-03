class CommentThreadsController < ApplicationController
  before_action :authenticate_reader!
  before_action :set_card, only: [:create]

  # authorize_actions_for CommentThread

  def create
    @comment_thread = @card.comment_threads.build(comment_thread_params)
    @comment_thread.locale = I18n.locale

    if @comment_thread.save
      render partial: 'cards/card', locals: {card: @comment_thread.card}
    else
      render json: @comment_thread.errors, status: :unprocessable_entity
    end
  end

  private
  def set_card
    @card = Card.find params[:card_id]
  end

  def comment_thread_params
    params.require(:comment_thread).permit(*%i(start length block_index
                                              original_highlight_text))
  end
end
