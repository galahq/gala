# frozen_string_literal: true

# @see CommentThread
class CommentThreadBroadcastJob < ActiveJob::Base
  retry_on StandardError

  def perform(comment_thread)
    ForumChannel.broadcast_to(
      comment_thread.forum,
      comment_thread: render_comment_thread(comment_thread)
    )
  end

  private

  def render_comment_thread(comment_thread)
    ActiveModel::Serializer.for(comment_thread).to_json
  end
end
