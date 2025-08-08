# frozen_string_literal: true

# @see Comment
class CommentBroadcastJob < ApplicationJob
  queue_as :critical

  def perform(comment)
    ForumChannel.broadcast_to comment.forum,
                              comment: render_comment(comment)
  end

  private

  def render_comment(comment)
    ActiveModel::Serializer.for(comment).to_json
  end
end
