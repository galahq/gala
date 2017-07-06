# frozen_string_literal: true

class ReplyNotificationBroadcastJob < ActiveJob::Base
  queue_as :default

  def perform(notification)
    ReaderNotificationsChannel
      .broadcast_to notification.reader,
                    notification: render_notification(notification)
  end

  private

  def render_notification(notification)
    ApplicationController.renderer.render notification
  end
end
