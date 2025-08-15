# frozen_string_literal: true

require 'barnes'
require 'puma_worker_killer'

environment ENV.fetch('RAILS_ENV', 'production')
workers ENV.fetch('WEB_CONCURRENCY', 2).to_i
max_threads_count = ENV.fetch('RAILS_MAX_THREADS', 5).to_i
min_threads_count = ENV.fetch('RAILS_MIN_THREADS', 5).to_i
threads min_threads_count, max_threads_count

# https://devcenter.heroku.com/articles/deploying-rails-applications-with-the-puma-web-server
enable_keep_alives(false) if respond_to?(:enable_keep_alives)
persistent_timeout ENV.fetch('PERSISTENT_TIMEOUT', 20).to_i

worker_timeout ENV.fetch('WORKER_TIMEOUT', 25).to_i
worker_shutdown_timeout ENV.fetch('WORKER_SHUTDOWN_TIMEOUT', 8).to_i

bind "tcp://0.0.0.0:#{ENV.fetch('PORT', 3000)}"

preload_app!

before_fork do
  PumaWorkerKiller.config do |config|
    config.ram                        = 1024 + 512
    config.frequency                  = 10.minutes.to_i
    config.percent_usage              = 0.85
    config.rolling_restart_frequency  = 12.hours.to_i
    config.reaper_status_logs         = true
  end
  PumaWorkerKiller.start
  Barnes.start
end

plugin :tmp_restart
