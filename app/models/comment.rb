class Comment < ApplicationRecord
  belongs_to :reader
  belongs_to :comment_thread

  translates :content

  acts_as_list  scope: :comment_thread

  validates :content, presence: :true

  after_create { CommentBroadcastJob.perform_now self }
  after_create_commit { CommentThreadBroadcastJob.perform_later comment_thread }
  after_create_commit :send_notifications_of_reply

  def timestamp
    I18n.l created_at, format: :long
  end

  private
  def send_notifications_of_reply
    notification_data = {
      notifier_id: reader.id,
      comment_thread_id: comment_thread.id,
      card_id: comment_thread.card.id,
      case_id: comment_thread.card.case.id,
      page_id: comment_thread.card.element.id,
    }

    (comment_thread.collocutors - [reader]).each do |r|
      Notification.create reader: r, category: :reply_to_thread, data: notification_data
    end
  end
end
