# frozen_string_literal: true

# A collection of {CommentThread}s made by a {Community}, pertaining to a
# particular {Case}
class Forum < ApplicationRecord
  belongs_to :case
  belongs_to :community

  has_many :comment_threads, dependent: :destroy
  has_many :comments, through: :comment_threads

  has_one :group, through: :community

end
