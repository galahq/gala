# frozen_string_literal: true

# A community is associated with a {Group} to connect it to its {Forum}s.
# Because a user may change her active community to see a different discussion,
# but may not change her active group (which could let her avoid a pre-test),
# this is distinct from Group.
#
# @attr name [Translated<String>]
# @attr description [Translated<String>]
#
# @see GlobalCommunity GlobalCommunity: this model’s null object
class Community < ApplicationRecord
  include Mobility

  translates :name, :description, fallbacks: true

  belongs_to :group

  has_many :invitations
  has_many :forums # One forum for each case the community is discussing

  delegate :comment_threads, to: :forum

  # The communities that have an active forum associated with them
  # @return [ActiveRecord::Relation<Community>]
  def self.active_for_case(case_id)
    joins(:forums).where(forums: { case_id: case_id })
  end

  # Is this Community-conforming model the {GlobalCommunity}?
  # @return [Boolean]
  def global?
    group.nil?
  end
end
