# frozen_string_literal: true

require 'dalli'

options = {
  failover: true,
  socket_timeout: 1.5,
  socket_failure_delay: 0.2,
  down_retry_delay: 60,
  pool_size: ENV.fetch('RAILS_MAX_THREADS') { 5 }.to_i
}

if ENV['MEMCACHIER_SERVERS'].present?
  servers = (ENV['MEMCACHIER_SERVERS'] || '').split(',')
  options[:username] = ENV['MEMCACHIER_USERNAME']
  options[:password] = ENV['MEMCACHIER_PASSWORD']
elsif ENV['MEMCACHED_URL'].present?
  servers = [ENV['MEMCACHED_URL']]
else
  servers = ['localhost:11211']
end

if Rails.env.development?
  Rails.application.config.cache_store = :memory_store
else
  Rails.application.config.cache_store = :dalli_store, servers, options
end
