# frozen_string_literal: true

class ReplyNotificationMailer < ApplicationMailer
  helper :cases
  helper :comment_threads

  def notify(notification)
    @notification = notification

    mail(to: @notification.reader.name_and_email,
         from: from_header,
         subject: subject_header) do |format|
      format.text
      format.html
    end
  end

  private

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
    comment_thread = @notification.comment_thread
    "RE: [#{@notification.case.kicker}] " \
      "“#{comment_thread.comments.first.content.truncate(40)}” " \
      "(##{comment_thread.id})"
  end
end
