# frozen_string_literal: true

mem_profiling_interval = ENV['MEMORY_PROFILING_INTERVAL_SECONDS']&.to_i
return if mem_profiling_interval.blank? || mem_profiling_interval < 1
return if Rails.env.test?

require 'concurrent'

Rails.application.config.after_initialize do
  task =
    Concurrent::TimerTask.new(execution_interval: mem_profiling_interval) do
      MemorySnapshotJob.perform_later
    rescue StandardError => e
      Rails.logger.error("Memory profiling task failed: #{e.message}")
    end

  task.execute
  Rails.application.config.x.memory_snapshot_task = task
end
