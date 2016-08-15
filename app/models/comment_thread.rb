class CommentThread < ApplicationRecord
  belongs_to :case
  belongs_to :group
  has_many :comments, dependent: :delete_all
end
