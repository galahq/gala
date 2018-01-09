# frozen_string_literal: true

# @see Comment
class CommentBroadcastJob < ActiveJob::Base
  queue_as :default

  def perform(comment)
    ForumChannel.broadcast_to comment.forum,
                              comment: render_comment(comment)
  end

  private

  def render_comment(comment)
    ApplicationController.renderer.render partial: 'comments/comment',
                                          locals: { comment: comment }
  end
end
