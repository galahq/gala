# frozen_string_literal: true

require 'barnes'

# Thread per process count allows context switching on IO-bound tasks for better CPU utilization.
threads_count = ENV.fetch('RAILS_MAX_THREADS', 3).to_i
threads(threads_count, threads_count)

# Processes count, allows better CPU utilization when executing Ruby code.
# Recommended to always run in at least one process so `rack-timeout` RACK_TERM_ON_TIMEOUT=1 can be used
# https://devcenter.heroku.com/articles/h12-request-timeout-in-ruby-mri
workers_count = ENV.fetch('WEB_CONCURRENCY', 2).to_i
workers(workers_count)

bind "tcp://0.0.0.0:#{ENV.fetch('PORT', 3000)}"

# restart server with $ touch tmp/restart.txt
plugin(:tmp_restart)

preload_app!

# Barnes plugin for memory profiling
before_fork do
  Barnes.start
end

on_worker_boot do
  MemoryProfiling.start if defined?(MemoryProfiling)
end

# Heroku strongly recommends upgrading to Puma 7+. If you cannot upgrade,
# Please see the Puma 6 and prior configuration section below.
#
# Puma 7+ already supports PUMA_PERSISTENT_TIMEOUT natively. Older Puma versions set:
#
# ```
# persistent_timeout(ENV.fetch("PUMA_PERSISTENT_TIMEOUT") { 95 }.to_i)
# ```
#
# Puma 7+ fixes a keepalive issue that affects long tail response time with Router 2.0.
# Older Puma versions set:
#
# ```
# enable_keep_alives(false) if respond_to?(:enable_keep_alives)
# ```
