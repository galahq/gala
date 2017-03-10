class Notification < ApplicationRecord
  belongs_to :reader

  enum category: [
    # When someone else makes a comment on a thread on which the reader has made
    # a comment.
    #
    # data: { :notifier_id, :comment_thread_id, :case_id, :page_id, :card_id }
    :reply_to_thread,
  ]

  serialize :data, Hash
end
