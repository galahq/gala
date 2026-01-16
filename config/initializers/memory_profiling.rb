# frozen_string_literal: true

module MemoryProfiling
  class << self
    def start
      interval = ENV['MEMORY_PROFILING_INTERVAL_SECONDS']&.to_i
      return if interval.nil? || interval < 1
      return if Rails.env.test?
      return unless web_dyno?
      return if started?

      require 'concurrent'

      task =
        Concurrent::TimerTask.new(execution_interval: interval) do
          MemorySnapshotJob.perform_now
        rescue StandardError => e
          Rails.logger.error("Memory profiling task failed: #{e.message}")
        end

      task.execute
      Rails.application.config.x.memory_snapshot_task = task
      @started = true
    rescue StandardError => e
      Rails.logger.error("Memory profiling start failed: #{e.message}")
    end

    private

    def web_dyno?
      ENV['DYNO']&.start_with?('web')
    end

    def started?
      @started == true
    end
  end
end
