class Group < ApplicationRecord
  has_many :comment_threads, dependent: :delete_all
  has_many :group_memberships, dependent: :delete_all
  has_many :readers, through: :group_memberships

  translates :name

  validates :context_id, uniqueness: true, if: -> () { context_id.present? }

  def self.upsert context_id:, name:
    group = find_or_initialize_by context_id: context_id
    group.name = name
    group.save! if group.changed?
    group
  end
end
