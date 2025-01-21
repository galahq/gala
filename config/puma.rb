# frozen_string_literal: true

require 'barnes'
require 'puma_worker_killer'

persistent_timeout ENV.fetch('PERSISTENT_TIMEOUT') { 20 }.to_i

max_threads_count = ENV.fetch('MAX_THREADS') { 5 }.to_i
min_threads_count = ENV.fetch('MIN_THREADS') { max_threads_count }.to_i
threads min_threads_count, max_threads_count

bind "tcp://0.0.0.0:#{ENV.fetch('PORT', 3000)}"

environment ENV.fetch('RAILS_ENV') { 'production' }
workers     ENV.fetch('WEB_CONCURRENCY') { 2 }.to_i

preload_app!

before_fork do
  PumaWorkerKiller.config do |config|
    config.ram                       = 512  # mb
    config.frequency                 = 10    # seconds
    config.percent_usage             = 0.98
    config.rolling_restart_frequency = 300  #6 * 3600 # every 6 hours
  end
  PumaWorkerKiller.start
  Barnes.start
end

# on_worker_boot do
#   ActiveSupport.on_load(:active_record) do
#     ActiveRecord::Base.establish_connection
#   end
# end

plugin :tmp_restart
