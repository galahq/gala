# frozen_string_literal: true

module CommentThreadsHelper
  def threads_for_card(comment_threads, card_id)
    @comment_threads_by_card ||= comment_threads.group_by(&:card_id)
    @comment_threads_by_card[card_id]
  end
end
