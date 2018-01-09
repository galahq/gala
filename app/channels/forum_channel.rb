# frozen_string_literal: true

# Broadcasts the new {CommentThread}s and {Comment}s that are created in the
# user’s active forum.
class ForumChannel < ApplicationCable::Channel
  def subscribed
    current_reader.reload
    kase = Case.find_by_slug(params[:case_slug])
    forum = current_reader.active_community.forums.find_by case: kase
    stream_for forum
  end

  def unsubscribed; end
end
