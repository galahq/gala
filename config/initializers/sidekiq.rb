# frozen_string_literal: true

# This file is used to configure Sidekiq with Redis.
# Redis is no longer a dependency, experimenting using :inline for now.

=begin

require 'sidekiq'

# server
Sidekiq.configure_server do |config|
  config.redis = { url: ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" } }
end
# client
Sidekiq.configure_client do |config|
  config.redis = { url: ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" } }
end

=end
