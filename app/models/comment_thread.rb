class CommentThread < ApplicationRecord
  belongs_to :card
  has_many :comments
end
