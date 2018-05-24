# frozen_string_literal: true

# A lock prevents a user from editing a model that another user is already
# editing. A user must take a lock on a model before writing to it.
class Lock < ApplicationRecord
  belongs_to :lockable, polymorphic: true
  belongs_to :reader
  belongs_to :case, inverse_of: :active_locks

  validates :lockable_type, only_polymorphic: true

  before_validation :set_case_from_lockable, unless: -> { self.case.present? }

  private

  def set_case_from_lockable
    self.case = lockable.case
  end
end
