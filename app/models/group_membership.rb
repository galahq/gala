# frozen_string_literal: true

# A relationship between a {Group} and a {Reader} that is automatic and has no
# “request” associated with it, nor opportunity to “accept” or “decline”
class GroupMembership < ApplicationRecord
  belongs_to :reader
  belongs_to :group

  after_create :set_readers_active_community

  def set_readers_active_community
    return if reader.has_role? :instructor
    reader.update active_community_id: group.community.id
  end
end
