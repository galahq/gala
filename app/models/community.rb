# frozen_string_literal: true

# A community is associated with a {Group} to connect it to its {Forum}s.
# Because a user may change her active community to see a different discussion,
# but may not change her active group (which could let her avoid a pre-test),
# this is distinct from Group.
#
# @attr name [Translated<String>]
# @attr description [Translated<String>]
# @attr universal [Boolean] universal communities have Forums for every case
#
# @see GlobalCommunity GlobalCommunity: this model’s null object
class Community < ApplicationRecord
  include Mobility

  translates :name, :description, fallbacks: true

  belongs_to :group, optional: true

  has_many :invitations, dependent: :destroy
  # One forum for each case the community is discussing
  has_many :forums, dependent: :destroy
  has_many :group_memberships, through: :group

  after_save :ensure_forum_exists_for_every_case, if: :universal

  delegate :comment_threads, to: :forum

  scope :universal, -> { where(universal: true) }

  alias memberships group_memberships

  # The communities that have an active forum associated with them
  # @return [ActiveRecord::Relation<Community>]
  def self.active_for_case(case_id)
    joins(:forums).where(forums: { case_id: case_id })
  end

  # Instructors are automatically invited to this instructors-only community,
  # which is added in db/seeds but really must exist.
  def self.case_log
    case_log = order(:created_at).find_by %(name @> '{"en": "CaseLog"}'::jsonb)
    case_log ||= create(name: 'CaseLog')
    case_log
  end

  # Universal communities need to have a forum on all Cases
  def ensure_forum_exists_for_every_case
    Case.where.not(id: forums.map(&:case_id)).find_each do |kase|
      kase.forums.create community: self
    end
  end

end
