class ReplyNotificationMailerPreview < ActionMailer::Preview
  def notify
    ReplyNotificationMailer.notify ReplyNotification.last
  end
end
