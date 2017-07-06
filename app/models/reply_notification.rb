# frozen_string_literal: true

class ReplyNotification < ApplicationRecord
  belongs_to :reader
  belongs_to :notifier, class_name: 'Reader'
  belongs_to :comment
  belongs_to :comment_thread
  belongs_to :case
  belongs_to :page
  belongs_to :card

  after_create_commit { ReplyNotificationBroadcastJob.perform_now self }
  after_create_commit { ReplyNotificationMailer.notify(self).deliver }

  def message
    I18n.t 'notifications.replied_to_your_comment',
           notifier: notifier.name,
           case_kicker: self.case.kicker
  end
end
