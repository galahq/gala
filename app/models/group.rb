# frozen_string_literal: true

# Group is our generic stand-in for a “classroom,” which is open to
# non-classroom uses as well. A group connects {Reader}s for discussion in a
# {Community}, with {Forum}s for every {Case} that the group is officially
# studying together. This is the model that is created in response to an LTI
# launch request to group Readers who come from the same course.
#
# @attr context_id [String] a UUID provided to our platform by an LMS
#
# @see GlobalGroup GlobalGroup: this model’s null object
class Group < ApplicationRecord
  include Mobility

  default_scope { order created_at: :desc }

  translates :name, fallbacks: true

  has_many :group_memberships, dependent: :destroy
  has_many :readers, through: :group_memberships
  has_many :deployments, dependent: :destroy
  has_many :cases, through: :deployments

  has_one :community, dependent: :destroy

  validates :name, presence: true
  validates :context_id, uniqueness: true, if: -> { context_id.present? }

  after_create :create_associated_community

  # Groups that the given user has admin privileges in
  def self.administered_by(admin)
    joins(:group_memberships)
      .where(group_memberships: { reader_id: admin.id })
      .merge(GroupMembership.admin)
  end

  # Find or create a Group with a given context id (from LTI) and set or update
  # its name.
  # @return [Group]
  def self.upsert(context_id:, name:)
    group = find_or_initialize_by context_id: context_id
    group.name = name
    group.save! if group.changed?
    group
  end

  # Ensure the passed reader is an administrator of the group. This method is
  # idempotent.
  def add_administrator(reader)
    GroupMembership
      .find_or_initialize_by(group: self, reader: reader)
      .tap do |group_membership|
      group_membership.status = :admin
      group_membership.save! if group_membership.changed?
    end
  end

  # Every Group needs a Community. They are only different to allow Readers to
  # change part of the effect of being in a Group without being able to change
  # another.
  # @see Community
  def create_associated_community
    create_community(name: name)
  end

  # @return [Deployment, GenericDeployment]
  def deployment_for_case(kase)
    deployments.find_by(case: kase) || GenericDeployment.new
  end

  def active?
    true
  end
end
