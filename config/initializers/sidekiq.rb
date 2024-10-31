# frozen_string_literal: true

require 'sidekiq'
require 'openssl'

# Define Redis configuration with optional TLS support
def redis_configuration
  # Fetch Redis URL from environment variable, default to local Redis if not set
  url = ENV.fetch("REDIS_URL", "redis://localhost:6379/1")

  {
    url: url,
    # If the Redis URL uses 'rediss://', set up TLS configuration
    ssl_params: if url.start_with?("rediss://")
      {
        # Set `verify_mode` to control certificate verification:
        # Use VERIFY_PEER for production, VERIFY_NONE for development (unsafe)
        verify_mode: OpenSSL::SSL::VERIFY_NONE,

        # Optional: Provide a custom CA file if using a self-signed certificate.
        # Uncomment and replace path if needed:
        # ca_file: Rails.root.join("config/certs/AmazonRootCA1.pem").to_s,

        # Optional: Set min/max TLS versions. Comment out if not needed:
        # min_version: OpenSSL::SSL::TLS1_2_VERSION,
        # max_version: OpenSSL::SSL::TLS1_3_VERSION
      }
    else
      nil # No TLS required for non-TLS URLs
    end
  }.compact # Remove nil values from hash
end

# Configure Sidekiq server and client Redis connections
Sidekiq.configure_server { |config| config.redis = redis_configuration }
Sidekiq.configure_client { |config| config.redis = redis_configuration }
