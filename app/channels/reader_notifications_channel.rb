# frozen_string_literal: true

# Broadcasts notifications when other readers reply to a reader’s {Comment}
class ReaderNotificationsChannel < ApplicationCable::Channel
  def subscribed
    stream_for current_reader
  end

  def unsubscribed; end
end
