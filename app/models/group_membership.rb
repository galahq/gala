# frozen_string_literal: true

# A relationship between a {Group} and a {Reader} that is automatic and has no
# “request” associated with it, nor opportunity to “accept” or “decline”
class GroupMembership < ApplicationRecord
  attribute :status, :integer, default: 0 # Normal
  enum status: { normal: 0, admin: 1 }

  belongs_to :reader
  belongs_to :group

  after_create :set_readers_active_community

  def set_readers_active_community
    reader.update active_community_id: group.community.id
  end
end
