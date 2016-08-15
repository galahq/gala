class Comment < ApplicationRecord
  belongs_to :reader
  belongs_to :comment_thread

  translates :content
end
