# frozen_string_literal: true

def redis_configuration
  redis_url = ENV.fetch("REDIS_URL") { "redis://redis:6379/1" }

  uri = URI.parse(redis_url)
  if uri.scheme == "rediss"
    {
      url: redis_url,
      ssl_params: {
        verify_mode: OpenSSL::SSL::VERIFY_NONE
      },
      timeout: 2
    }
  else
    { url: redis_url, timeout: 2 }
  end
end

# sidekiq, server
Sidekiq.configure_server do |config|
  config.redis = redis_configuration
end

# sidekiq, client
Sidekiq.configure_client do |config|
  config.redis = redis_configuration
end
