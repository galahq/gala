# frozen_string_literal: true

# frozen_string_literal: true

# Provides a method to enqueue a CleanupLocksJob to unlock resources
# associated with the current reader
module CleanupLocks
  extend ActiveSupport::Concern

  private

  def enqueue_cleanup_locks_job
    return unless current_reader.present?
    CleanupLocksJob.perform_later(reader_id: current_reader.id)
  end
end
