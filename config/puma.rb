# frozen_string_literal: true

# Puma Configuration Architecture
# Standard-2X Dyno (1024MB RAM, 2 CPU cores)
#
# +---------------------------------------------------------------+
# |                        Heroku Router                          |
# |                     30s timeout limit                         |
# |                   keep-alives disabled  (router 2.0 issue)    |
# +---------------------------------------------------------------+
#
# +---------------------------------------------------------------+
# |                        Puma Master                            |
# |                                                               |
# |  PumaWorkerKiller: 15min checks, 24h rolling restarts         |
# |  Barnes: Performance monitoring                               |
# |  Memory limit: 850MB, Kill threshold: 680MB (80%)             |
# |  YJIT: ~50MB         [██████████                          ]   |
# |  Headroom: 174MB     [████████████████                    ]   |
# +---------------------------------------------------------------+
#
# +---------------------------+    +---------------------------+
# |         Worker 1          |    |         Worker 2          |
# |                           |    |                           |
# |  Thread Pool: 3-6 threads |    |  Thread Pool: 3-6 threads |
# |                           |    |                           |
# |  +-----+ +-----+ +-----+  |    |  +-----+ +-----+ +-----+  |
# |  |  T  | |  T  | |  T  |  |    |  |  T  | |  T  | |  T  |  |
# |  +-----+ +-----+ +-----+  |    |  +-----+ +-----+ +-----+  |
# |  +-----+ +-----+ +-----+  |    |  +-----+ +-----+ +-----+  |
# |  |  T  | |  T  | |  T  |  |    |  |  T  | |  T  | |  T  |  |
# |  +-----+ +-----+ +-----+  |    |  +-----+ +-----+ +-----+  |
# |                           |    |                           |
# |  Memory: <= 680MB         |    |  Memory: <= 680MB         |
# |  Timeout: 25s             |    |  Timeout: 25s             |
# +---------------------------+    +---------------------------+
#
# +---------------------------------------------------------------+
# |                     Memory Layout (1024MB)                    |
# |                                                               |
# |  Application: 850MB  [████████████████████████████████████]   |
# |  Kill at: 680MB      [████████████████████████████████    ]   |
# |  YJIT: ~50MB         [██████████                          ]   |
# |  Headroom: 174MB     [████████████████                    ]   |
# +---------------------------------------------------------------+
#
# Concurrent Request Capacity: 2 workers × 6 threads = 12 requests
# YJIT Performance Boost: 15-30% improvement* (not verified)
# Worker Lifecycle: Graceful boot/shutdown with DB connection mgmt

require 'barnes'
require 'puma_worker_killer'

environment ENV.fetch('RAILS_ENV', 'production')

max_threads_count = ENV.fetch('RAILS_MAX_THREADS', 6).to_i
min_threads_count = ENV.fetch('RAILS_MIN_THREADS', 3).to_i
threads min_threads_count, max_threads_count

enable_keep_alives(false) if respond_to?(:enable_keep_alives)
persistent_timeout ENV.fetch('PERSISTENT_TIMEOUT', 15).to_i
worker_timeout ENV.fetch('WORKER_TIMEOUT', 25).to_i
worker_shutdown_timeout ENV.fetch('WORKER_SHUTDOWN_TIMEOUT', 15).to_i

bind "tcp://0.0.0.0:#{ENV.fetch('PORT', 3000)}"
preload_app!

before_fork do
  # PumaWorkerKiller.config do |c|
  #   c.ram                       = 850 # 850MB (accounting for YJIT overhead)
  #   c.frequency                 = 15.minutes.to_i
  #   c.percent_usage             = 0.80
  #   c.rolling_restart_frequency = 24.hours.to_i
  #   c.reaper_status_logs        = true # telemetry to Heroku
  # end

  # PumaWorkerKiller.start
  Barnes.start
end

on_worker_boot do
  ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
end

on_worker_shutdown do
  ActiveRecord::Base.connection_pool.disconnect! if defined?(ActiveRecord)
end

plugin :tmp_restart
