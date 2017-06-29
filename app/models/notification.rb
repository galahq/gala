# frozen_string_literal: true

class Notification < ApplicationRecord
  belongs_to :reader

  enum category: [
    # When someone else makes a comment on a thread on which the reader has made
    # a comment.
    #
    # data: { :notifier_id, :comment_thread_id, :case_id, :page_id, :card_id }
    :reply_to_thread
  ]

  serialize :data, Hash

  after_create_commit { NotificationBroadcastJob.perform_now self }

  def message
    case category
    when 'reply_to_thread'
      I18n.t 'notifications.replied_to_your_comment', notifier: notifier.name, case_kicker: self.case.kicker
    end
  end

  def notifier
    Reader.find data[:notifier_id]
  end

  def comment_thread
    CommentThread.find data[:comment_thread_id]
  end

  def case
    Case.find data[:case_id]
  end

  def page
    Page.find data[:page_id]
  end

  def card
    Card.find data[:card_id]
  end
end
