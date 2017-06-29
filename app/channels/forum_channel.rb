# frozen_string_literal: true

# Restart the server when this file is modified.
class ForumChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'forum_channel'
  end

  def unsubscribed; end
end
