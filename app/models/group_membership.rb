class GroupMembership < ApplicationRecord
  belongs_to :reader
  belongs_to :group
end
