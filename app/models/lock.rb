# frozen_string_literal: true

# A lock prevents a user from editing a model that another user is already
# editing. A user must take a lock on a model before writing to it.
class Lock < ApplicationRecord
  belongs_to :lockable, polymorphic: true
  belongs_to :reader
  belongs_to :case

  validates :lockable_type, only_polymorphic: true
end
