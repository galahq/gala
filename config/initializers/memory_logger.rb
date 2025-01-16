# frozen_string_literal: true

# Logs memory usage statistics in production environment

def puma_web_process?
  `ps -p #{Process.pid} -o command=`.include?('puma') rescue false
end

def format_memory(mb)
  if mb > 1024
    "%.2f GB" % (mb / 1024.0)
  else
    "%.2f MB" % mb
  end
end

if defined?(JEMALLOC) && puma_web_process?
  Thread.new do
    loop do
      sleep 30
      memory = GetProcessMem.new
      rss = memory.mb
      gc_stats = GC.stat

      puts "\n\033[34m=== Memory Stats (PID: #{Process.pid}) ===\033[0m"
      puts "\033[32m▸ RSS Memory: #{format_memory(rss)}"
      puts "▸ Objects: #{gc_stats[:total_allocated_objects].to_s.gsub(/(\d)(?=(\d{3})+(?!\d))/, '\\1,')}"
      puts "▸ GC Count: #{gc_stats[:count]}"
      puts "▸ Major GC: #{gc_stats[:major_gc_count]}"
      puts "▸ Minor GC: #{gc_stats[:minor_gc_count]}\033[0m\n"
    end
  end
else
  puts "JEMALLOC monitoring skipped for process #{Process.pid} (not a Puma web process)"
end

# if defined?(Rack::MiniProfiler)
#   Rack::MiniProfiler.config.position = 'bottom-right'
#   Rack::MiniProfiler.config.start_hidden = true

#   # Enable memory profiling through advanced debugging tools
#   Rack::MiniProfiler.config.enable_advanced_debugging_tools = true

#   # Skip profiling certain paths
#   Rack::MiniProfiler.config.skip_paths ||= []
#   Rack::MiniProfiler.config.skip_paths << '/assets/'
# else
#   puts "Rack::MiniProfiler is not defined"
# end

# class MemoryLogger
#   def initialize(app)
#     @app = app
#   end

#   def call(env)
#     before = GetProcessMem.new.mb
#     response = @app.call(env)
#     after = GetProcessMem.new.mb

#     puts(
#       "Memory Usage: #{after.round(2)}MB" \
#       " (Change: #{(after - before).round(2)}MB)" \
#       " Path: #{env['PATH_INFO']}"
#     )

#     response
#   end
# end

# # Only in development
# if Rails.env.development?
#   Rails.application.config.middleware.use MemoryLogger
# else
#   puts "MemoryLogger is not defined in development"
# end


# if defined?(Skylight)
#   ActiveSupport::Notifications.subscribe "process_action.action_controller" do |*args|
#     event = ActiveSupport::Notifications::Event.new(*args)
#     memory = GetProcessMem.new.mb

#     Skylight.track_annotation(
#       memory_mb: memory.round(2),
#       gc_count: GC.stat[:count],
#       gc_major_count: GC.stat[:major_gc_count]
#     )
#   end
# end


# if defined?(Skylight)
#   ActiveSupport::Notifications.subscribe "sql.active_record" do |*args|
#     event = ActiveSupport::Notifications::Event.new(*args)

#     if event.duration > 100  # Track slow queries (>100ms)
#       Skylight.track_annotation(
#         slow_query: event.payload[:sql],
#         query_duration: event.duration
#       )
#     end
#   end
# else
#   puts "Skylight is not defined"
# end
