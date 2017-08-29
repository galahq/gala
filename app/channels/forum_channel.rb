# frozen_string_literal: true

# Restart the server when this file is modified.
class ForumChannel < ApplicationCable::Channel
  def subscribed
    current_reader.reload
    forum = current_reader.active_community.forums
                          .find_by case: Case.find_by_slug(params[:case_slug])
    stream_for forum
  end

  def unsubscribed; end
end
