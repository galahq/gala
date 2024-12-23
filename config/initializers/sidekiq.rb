# frozen_string_literal: true

def redis_configuration
  redis_url = ENV.fetch('REDIS_URL') { 'redis://redis:6379/0' }
  ssl_params = if URI(redis_url).scheme == 'rediss'
                 { verify_mode: OpenSSL::SSL::VERIFY_NONE }
               else
                 {}
               end

  {
    url: redis_url,
    ssl_params: ssl_params,
    timeout: 5,
    reconnect_attempts: 1,
    network_timeout: 5
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
