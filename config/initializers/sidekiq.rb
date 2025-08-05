# frozen_string_literal: true

def redis_configuration
  redis_url = ENV.fetch('REDIS_URL', 'redis://redis:6379/0')
  ssl_verify = { verify_mode: OpenSSL::SSL::VERIFY_NONE }
  ssl_params = URI(redis_url).scheme == 'rediss' ? ssl_verify : {}

  {
    url: redis_url,
    ssl_params: ssl_params,
    reconnect_attempts: 5,
    network_timeout: 5
  }
end

# pop jobs from redis
Sidekiq.configure_server do |config|
  config.redis = redis_configuration
end

# push jobs to redis
Sidekiq.configure_client do |config|
  config.redis = redis_configuration
end
