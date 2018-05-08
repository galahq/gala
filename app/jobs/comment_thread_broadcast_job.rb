# frozen_string_literal: true

# @see CommentThread
class CommentThreadBroadcastJob < ActiveJob::Base
  queue_as :default

  def perform(comment_thread)
    ForumChannel.broadcast_to comment_thread.forum,
                              comment_thread: render_comment_thread(comment_thread)
  end

  private

  def render_comment_thread(comment_thread)
    ActiveModel::Serializer.for(comment_thread).as_json
  end
end
