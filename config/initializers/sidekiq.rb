# frozen_string_literal: true

require 'sidekiq'

redis_url = (ENV["REDIS_TEMPORARY_URL"] ||
            ENV["REDIS_URL"] ||
            "redis://localhost:6379/1").to_s.strip

# server
Sidekiq.configure_server do |config|
  config.redis = { url: redis_url }
end

# client
Sidekiq.configure_client do |config|
  config.redis = { url: redis_url }
end
