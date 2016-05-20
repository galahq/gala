class Group < ApplicationRecord
  has_many :comment_threads, dependent: :delete_all
  has_many :group_memberships, dependent: :delete_all
  has_many :readers, through: :group_memberships

  translates :name
end
