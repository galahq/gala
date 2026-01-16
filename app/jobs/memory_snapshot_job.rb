# frozen_string_literal: true

# Periodically capture RSS data to help detect memory regressions.
class MemorySnapshotJob < ApplicationJob
  queue_as :default

  def perform(label: nil, extra_context: {})
    MemoryProfileLogger.capture!(
      label: label || default_label,
      extra_context: extra_context
    )
  end

  private

  def default_label
    "Memory snapshot @ #{Time.current.utc.iso8601}"
  end
end

