# frozen_string_literal: true

# @see Forum
class ForumSerializer < ApplicationSerializer
  attribute(:moderateable) { ForumPolicy.new(current_user, object).moderate? }
  belongs_to :community
end
