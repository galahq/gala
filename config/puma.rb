# frozen_string_literal: true

require 'barnes'

# Thread per process count allows context switching on IO-bound tasks for better CPU utilization.
threads_count = Integer(ENV.fetch('RAILS_MAX_THREADS') { 5 })
threads(threads_count, threads_count)

# Processes count, allows better CPU utilization when executing Ruby code.
# Recommended to always run in at least one process so `rack-timeout` RACK_TERM_ON_TIMEOUT=1 can be used
# https://devcenter.heroku.com/articles/h12-request-timeout-in-ruby-mri
default_workers = ENV.fetch('RAILS_ENV', 'development') == 'production' ? 2 : 1
worker_count = Integer(ENV.fetch('WEB_CONCURRENCY') { default_workers })
workers(worker_count)
preload_app! if worker_count > 1

# PORT environment variable is set by Heroku in production.
port(ENV.fetch('PORT') { 3000 })

# Allow Puma to be restarted by the `rails restart` command locally.
plugin(:tmp_restart)

# Barnes plugin for memory profiling
before_fork do
  Barnes.start

  if ENV.fetch('RAILS_ENV', 'development') == 'production' && worker_count > 1
    require 'puma_worker_killer'
    PumaWorkerKiller.config do |config|
      # Backstop, not a fix: keeps combined worker RSS under the Standard-2X
      # 1024 MB quota while the memory work lands, and cycles workers daily
      # to reset slow growth.
      config.ram = Integer(ENV.fetch('PUMA_WORKER_KILLER_RAM', 920))
      config.frequency = 20
      config.percent_usage = 0.93
      config.rolling_restart_frequency = 24 * 3600
      config.rolling_restart_splay_seconds = 0.0..300.0
    end
    PumaWorkerKiller.start
  end

  # Compact the master's heap just before forking so as many pages as possible
  # stay copy-on-write-shared between the workers.
  3.times { GC.start }
  GC.compact
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
