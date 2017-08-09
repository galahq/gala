# frozen_string_literal: true

# Mock public API in GlobalGroup
class Group < ApplicationRecord
  has_many :group_memberships, dependent: :destroy
  has_many :readers, through: :group_memberships
  has_one :community
  has_many :deployments, dependent: :destroy

  include Mobility
  translates :name, fallbacks: true

  validates :context_id, uniqueness: true, if: -> () { context_id.present? }

  def self.upsert(context_id:, name:)
    group = find_or_initialize_by context_id: context_id
    group.name = name
    group.save! if group.changed?
    group
  end

  def deployment_for_case(kase)
    deployments.find_by(case: kase) || GenericDeployment.new
  end

  def active?
    true
  end
end
