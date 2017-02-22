class Comment < ApplicationRecord
  belongs_to :reader
  belongs_to :comment_thread

  translates :content

  acts_as_list  scope: :comment_thread

  validates :content, presence: :true

  after_create { CommentBroadcastJob.perform_now self }
  after_create_commit { CommentThreadBroadcastJob.perform_later comment_thread }

  def timestamp
    I18n.l created_at, format: :long
  end
end
