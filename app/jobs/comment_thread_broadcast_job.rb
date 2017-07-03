# frozen_string_literal: true

class CommentThreadBroadcastJob < ActiveJob::Base
  queue_as :default

  def perform(comment_thread)
    ActionCable.server
               .broadcast 'forum_channel',
                          comment_thread: render_comment_thread(comment_thread)
  end

  private

  def render_comment_thread(comment_thread)
    ApplicationController.renderer
                         .render partial: 'comment_threads/comment_thread',
                                 locals: { comment_thread: comment_thread }
  end
end
