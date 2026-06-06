class DevelopmentLiveReloadChannel < ApplicationCable::Channel
  STREAM_NAME = "development:live_reload"

  def self.stream_name
    STREAM_NAME
  end

  def subscribed
    return reject unless Rails.env.development?

    stream_from STREAM_NAME
  end
end
