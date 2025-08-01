# frozen_string_literal: true

# @see Comment
class CommentBroadcastJob < ActiveJob::Base
  retry_on StandardError

  def perform(comment)
    ForumChannel.broadcast_to comment.forum,
                              comment: render_comment(comment)
  end

  private

  def render_comment(comment)
    ActiveModel::Serializer.for(comment).to_json
  end
end
