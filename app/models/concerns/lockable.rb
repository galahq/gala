# frozen_string_literal: true

# An element that supports multiple editors by requiring a user to take a lock
# before editing. This way, others can told that the element is being edited
# and can be prevented from making their edits.
module Lockable
  extend ActiveSupport::Concern

  included do
    has_one :lock, as: :lockable, dependent: :destroy
  end

  def lock_by(reader)
    create_lock! reader: reader
  rescue ActiveRecord::RecordNotUnique
    nil
  end

  def locked?
    lock.present?
  end

  def locked_by?(reader)
    locked? && lock.reader == reader
  end

  def unlock
    update! lock: nil
  end
end
