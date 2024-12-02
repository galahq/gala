# frozen_string_literal: true

def redis_configuration
  redis_url = ENV.fetch("REDIS_URL") { "redis://redis:6379/1" }

  # ensure we use TLS if `rediss://` is in the URL
  if redis_url.start_with?("rediss://")
    {
      url: redis_url,
      ssl_params: {
        # for custom CA file, specify it here:
        # ca_file: Rails.root.join("config/certs/AmazonRootCA1.pem").to_s,
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
