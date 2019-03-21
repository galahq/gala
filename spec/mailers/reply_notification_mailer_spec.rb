# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReplyNotificationMailer do
  describe 'notify' do
    it 'includes reply to header for inbound responses' do
      thread = create :comment_thread
      mail = reply_notification_mail thread

      reply_to = "reply+#{thread.key}@mailbox.learngala.com"
      expect(mail.reply_to).to include(reply_to)
    end
  end

  private

  def reply_notification_mail(thread)
    new_comment = create :comment, comment_thread: thread
    notification = create :reply_notification, comment: new_comment

    ReplyNotificationMailer.notify notification
  end
end
