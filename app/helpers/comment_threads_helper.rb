# frozen_string_literal: true

module CommentThreadsHelper
  def comment_thread_url(locale, comment_thread)
    "#{case_url(locale, comment_thread.card.case.slug)}" \
      "/#{comment_thread.card.element.case_element.position}" \
      "/cards/#{comment_thread.card_id}/comments"
  end

  def threads_for_card(comment_threads, card_id)
    @comment_threads_by_card ||= comment_threads.group_by(&:card_id)
    @comment_threads_by_card[card_id]
  end
end
