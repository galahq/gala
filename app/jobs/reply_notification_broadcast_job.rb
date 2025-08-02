# frozen_string_literal: true

# @see ReplyNotification
class ReplyNotificationBroadcastJob < ApplicationJob
  queue_as :critical

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
