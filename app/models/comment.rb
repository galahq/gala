class Comment < ApplicationRecord
  belongs_to :reader
  belongs_to :comment_thread

  translates :content

  acts_as_list  scope: :comment_thread

  validates :content, presence: :true

  after_create_commit { CommentBroadcastJob.perform_later self }

  def timestamp
    I18n.l created_at, format: :long
  end
end
