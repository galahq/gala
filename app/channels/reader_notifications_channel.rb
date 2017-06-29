# frozen_string_literal: true

class ReaderNotificationsChannel < ApplicationCable::Channel
  def subscribed
    stream_for current_reader
  end

  def unsubscribed; end
end
