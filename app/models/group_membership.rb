# frozen_string_literal: true

class GroupMembership < ApplicationRecord
  belongs_to :reader
  belongs_to :group

  after_create :set_readers_active_community

  def set_readers_active_community
    reader.update active_community_id: group.community.id
  end
end
