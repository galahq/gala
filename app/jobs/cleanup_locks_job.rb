# frozen_string_literal: true

# Job to clean up locks that have been held for too long.
# @see Lockable
class CleanupLocksJob < ApplicationJob
  queue_as :default

  def perform(reader_id: nil, destroy_after: 8.hours.to_i)
    locks_to_cleanup = if reader_id.present?
                         Lock.where(reader_id: reader_id)
                       else
                         cutoff_time = Time.now - destroy_after
                         Lock.where('created_at <= ?', cutoff_time)
                       end

    unlock_resources(locks_to_cleanup)
  end

  private

  def unlock_resources(locks)
    locks.each do |lock|
      unlock_single_resource(lock)
    end
  end

  def unlock_single_resource(lock)
    lock.destroy!
    BroadcastEdit.to(lock, type: :destroy, session_id: nil)
  rescue StandardError => e
    Rails.logger.error "destroy Lock##{lock.id} failed: #{e.message}"
  end
end
