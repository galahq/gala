# frozen_string_literal: true

require 'puma_worker_killer'

# PumaWorkerKiller Configuration
PumaWorkerKiller.enable_rolling_restart
PumaWorkerKiller.config do |config|
  config.ram = 1024 # 1GB RAM
  config.frequency = 30 # Check memory every 30 seconds
  config.percent_usage = 0.90 # Restart if memory exceeds 90%
  config.rolling_restart_frequency = 6 * 3600 # Restart all workers every 6 hours
  config.pre_term = ->(worker) { Rails.logger.info("Terminating worker #{worker.pid} for memory usage") }
end

PumaWorkerKiller.start

# Puma Configuration
port ENV.fetch('PORT', 3000)
threads_count = ENV.fetch("RAILS_MAX_THREADS", 5).to_i
threads threads_count, threads_count
workers ENV.fetch("WEB_CONCURRENCY", 2).to_i

preload_app!
nakayoshi_fork
wait_for_less_busy_worker 0.001

before_fork do
  ActiveRecord::Base.connection_pool.disconnect! if defined?(ActiveRecord)
  Redis.current.disconnect! if defined?(Redis)
end

on_worker_boot do
  ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
  Redis.current = Redis.new(url: ENV['REDIS_URL']) if defined?(Redis)
end

plugin :tmp_restart





# workers ENV.fetch("WEB_CONCURRENCY") { 2 }
# threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }.to_i
# threads threads_count, threads_count

# preload_app!

# rackup DefaultRackup
# port ENV.fetch("PORT") { 3000 }
# environment ENV.fetch("RAILS_ENV") { "development" }


# # This configuration file will be evaluated by Puma. The top-level methods that
# # are invoked here are part of Puma's configuration DSL. For more information
# # about methods provided by the DSL, see https://puma.io/puma/Puma/DSL.html.

# # Puma starts a configurable number of processes (workers) and each process
# # serves each request in a thread from an internal thread pool.

# port ENV.fetch('PORT', 3000)

# # The ideal number of threads per worker depends both on how much time the
# # application spends waiting for IO operations and on how much you wish to
# # to prioritize throughput over latency.
# #
# # As a rule of thumb, increasing the number of threads will increase how much
# # traffic a given process can handle (throughput), but due to CRuby's
# # Global VM Lock (GVL) it has diminishing returns and will degrade the
# # response time (latency) of the application.
# #
# # The default is set to 3 threads as it's deemed a decent compromise between
# # throughput and latency for the average Rails application.
# #
# # Any libraries that use a connection pool or another resource pool should
# # be configured to provide at least as many connections as the number of
# # threads. This includes Active Record's `pool` parameter in `database.yml`.
# threads_count = ENV.fetch("RAILS_MAX_THREADS", 2)
# threads threads_count, threads_count

# # Specifies the number of `workers` to boot in clustered mode.
# # Workers are forked web server processes. If using threads and workers together
# # the concurrency of the application would be max `threads` * `workers`.
# # Workers do not work on JRuby or Windows (both of which do not support
# # processes). It defaults to the number of (virtual cores * 2).
# #workers ENV.fetch("WEB_CONCURRENCY", 2)

# # Specifies the `worker_timeout` threshold that Puma will use to wait before
# # terminating a worker in development environments.
# # worker_timeout 3600 if ENV.fetch("RAILS_ENV", "development") == "development"

# # Use the `preload_app!` method when specifying a `workers` number.
# # This directive tells Puma to first boot the application and load code
# # before forking the application. This takes advantage of Copy On Write
# # process behavior so workers use less memory.
# #preload_app!

# # Allow puma to be restarted by `bin/rails restart` command.
# plugin :tmp_restart



# ###



# # threads_count = ENV.fetch('RAILS_MAX_THREADS', 3)
# # threads threads_count, threads_count

# # # Specifies the `environment` that Puma will run in.
# # rails_env = ENV.fetch('RAILS_ENV', 'development')
# # environment rails_env

# # case rails_env
# # when 'development'
# #   if ENV['JEMALLOC']
# #     # Use single worker when JEMALLOC is enabled for memory monitoring
# #     workers 1
# #   else
# #     # Use multiple workers when JEMALLOC is not enabled
# #     require 'concurrent-ruby'
# #     workers_count = Integer(ENV.fetch('WEB_CONCURRENCY') { Concurrent.available_processor_count })
# #     workers workers_count if workers_count > 1
# #   end

# #   preload_app!

# #   # Specifies a very generous `worker_timeout` so that the worker
# #   # isn't killed by Puma when suspended by a debugger.
# #   worker_timeout 3600
# # end

# # # Specifies the `port` that Puma will listen on to receive requests; default is 3000.
# # port ENV.fetch('PORT', 3000)

# # # Allow puma to be restarted by `bin/rails restart` command.
# # plugin :tmp_restart
