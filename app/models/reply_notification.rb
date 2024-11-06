# frozen_string_literal: true

# The record of a reply to a {Reader}’s {Comment}. All the many `belongs_to`
# relations are needed for the websocket notification to trigger a Toast with
# a ReactRouter link to the reply
class ReplyNotification < ApplicationRecord
  belongs_to :reader
  belongs_to :notifier, class_name: 'Reader'
  belongs_to :comment
  belongs_to :comment_thread
  belongs_to :case
  belongs_to :page, optional: true
  belongs_to :card, optional: true

  after_create_commit { ReplyNotificationBroadcastJob.perform_now self }
  after_create_commit { ReplyNotificationMailer.notify(self).deliver_later }

  def message
    I18n.t 'notifications.replied_to_your_comment',
           notifier: notifier.name,
           case_kicker: self.case.kicker
  end
end
