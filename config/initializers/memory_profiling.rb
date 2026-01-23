# frozen_string_literal: true

return unless ENV['ENABLE_MEMORY_PROFILING'].present?
return if Rails.env.test? || Rails.env.development?

require 'concurrent'

Rails.application.config.after_initialize do
  interval_seconds =
    ENV.fetch('MEMORY_PROFILING_INTERVAL_SECONDS', 300).to_i
  interval_seconds = 60 if interval_seconds <= 0

  task =
    Concurrent::TimerTask.new(execution_interval: interval_seconds) do
      MemorySnapshotJob.perform_later
    rescue StandardError => e
      Rails.logger.error("Memory profiling task failed: #{e.message}")
    end

  task.execute
  Rails.application.config.x.memory_snapshot_task = task
end
