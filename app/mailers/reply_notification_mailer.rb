# frozen_string_literal: true

# @see ReplyNotification
class ReplyNotificationMailer < ApplicationMailer
  helper :comment_threads

  def notify(notification)
    @notification = notification
    return unless reader.send_reply_notifications

    attach_cover_image

    send_mail do |format|
      format.text
      format.html
    end
  end

  private

  def reader
    @notification.reader
  end

  def attach_cover_image
    return unless @notification.case.cover_image.attached?

    kase = CaseDecorator.decorate @notification.case
    attachments.inline['cover'] = kase.cover_image_attachment
  end

  def send_mail(&block)
    mail(
      to: reader.name_and_email,
      from: from_header,
      reply_to: reply_to_header,
      subject: subject_header,
      &block
    )
  end

  # Build the from header. We’re setting the from name to the name of the
  # reader whose comment triggered the notification, but the from address
  # remains our notification address so as not to trip spam filters
  def from_header
    "#{@notification.notifier.name} <#{ApplicationMailer::FROM_ADDRESS}>"
  end

  # Build the email subject as follows
  # RE: [National Adaptation] “I understand that Ethiopia would be a...” (# 46)
  #
  # Every notification of a reply to the same original comment will have the
  # same subject so that they can be threaded
  def subject_header
    "RE: [#{@notification.case.kicker}] " \
      "“#{thread.comments&.first&.content&.truncate(40)}” " \
      "(##{thread.id})"
  end

  def reply_to_header
    "reply+#{thread.key}@mailbox.learngala.com"
  end

  def thread
    @notification.comment_thread
  end
end
