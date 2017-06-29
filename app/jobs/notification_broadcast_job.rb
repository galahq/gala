# frozen_string_literal: true

class NotificationBroadcastJob < ActiveJob::Base
  queue_as :default

  def perform(notification)
    ReaderNotificationsChannel.broadcast_to notification.reader, notification: render_notification(notification)
  end

  private

  def render_notification(notification)
    ApplicationController.renderer.render partial: 'notifications/notification', locals: { notification: notification }
  end
end
