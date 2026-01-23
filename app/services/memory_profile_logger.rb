# frozen_string_literal: true

# Capture on-demand RSS snapshots and forward them to Sentry.
class MemoryProfileLogger
  SNAPSHOT_MESSAGE = 'Memory snapshot'
  MEMORY_CONTEXT_KEY = 'memory'

  class << self
    def capture!(label: SNAPSHOT_MESSAGE, extra_context: {})
      return unless defined?(Sentry)

      Sentry.with_scope do |scope|
        scope.set_context(MEMORY_CONTEXT_KEY, rss_context)
        scope.set_extras(extra_context) if extra_context.present?
        scope.set_tags('memory_snapshot' => 'true', 'memory_label' => label)

        Sentry.capture_message(label || SNAPSHOT_MESSAGE)
      end
    end

    private

    def rss_context
      rss_kb = `ps -o rss= -p #{Process.pid}`.to_i
      {
        pid: Process.pid,
        rss_kb: rss_kb,
        rss_mb: (rss_kb / 1024.0).round(2)
      }
    end
  end
end
