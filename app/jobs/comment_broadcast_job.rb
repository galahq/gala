class CommentBroadcastJob < ActiveJob::Base
  queue_as :default

  def perform comment
    ActionCable.server.broadcast 'forum_channel', comment: render_comment(comment)
  end


  private
  def render_comment comment
    ApplicationController.renderer.render partial: 'comments/comment', locals: { comment: comment }
  end

end
