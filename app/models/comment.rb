class Comment < ApplicationRecord
  belongs_to :reader
  belongs_to :comment_thread

  translates :content

  acts_as_list  scope: :comment_thread
end
