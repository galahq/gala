# frozen_string_literal: true

# A collection of {CommentThread}s made by a {Community}, pertaining to a
# particular {Case}
class Forum < ApplicationRecord
  belongs_to :case
  belongs_to :community

  has_many :comment_threads

  def community
    super || GlobalCommunity.instance
  end
end
