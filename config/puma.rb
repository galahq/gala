# frozen_string_literal: true

require 'barnes'

Barnes.start if defined?(Barnes)

rails_env = ENV.fetch('RAILS_ENV', 'development')
environment rails_env

max_threads_count = ENV.fetch('RAILS_MAX_THREADS', 6).to_i
min_threads_count = ENV.fetch('RAILS_MIN_THREADS', 3).to_i
threads min_threads_count, max_threads_count

port ENV.fetch('PORT', 3000)
pidfile ENV.fetch('PIDFILE', 'tmp/pids/server.pid')

worker_timeout 3600 if rails_env == 'development'
worker_shutdown_timeout ENV.fetch('WORKER_SHUTDOWN_TIMEOUT', 15).to_i
persistent_timeout ENV.fetch('PERSISTENT_TIMEOUT', 15).to_i
# Keep-alives stay enabled so Router 2.0 can reuse sockets efficiently.
# enable_keep_alives(false)  <-- remove this line

# Standard-2X dynos expose two CPU cores; run two workers by default.
web_concurrency = ENV.fetch('WEB_CONCURRENCY', 2).to_i
workers web_concurrency if web_concurrency.positive?
preload_app!

before_fork do
  ActiveRecord::Base.connection_pool.disconnect! if defined?(ActiveRecord)
end

on_worker_boot do
  ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
end

on_worker_shutdown do
  ActiveRecord::Base.connection_pool.disconnect! if defined?(ActiveRecord)
end

plugin :tmp_restart
