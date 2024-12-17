# frozen_string_literal: true

def redis_configuration
  redis_url = ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" }
  ssl_params = if URI(redis_url).scheme == "rediss"
                 { verify_mode: OpenSSL::SSL::VERIFY_NONE }
               else
                 {}
               end

  {
    url: redis_url,
    ssl_params: ssl_params,
    timeout: 2
  }
end

# Sidekiq server configuration
Sidekiq.configure_server do |config|
  config.redis = redis_configuration
end

# Sidekiq client configuration
Sidekiq.configure_client do |config|
  config.redis = redis_configuration
end
