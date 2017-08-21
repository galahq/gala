# frozen_string_literal: true

class Forum < ApplicationRecord
  belongs_to :case
  belongs_to :community
  has_many :comment_threads

  def community
    super || GlobalCommunity.instance
  end
end
