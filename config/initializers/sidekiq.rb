# frozen_string_literal: true

require 'rack/session/cookie'
require 'sidekiq/web'

def redis_configuration
  redis_url = ENV.fetch('REDIS_URL', 'redis://localhost:6379/0')
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

sidekiq_session_options = {
  key: '_gala_sidekiq_session',
  path: '/sidekiq',
  same_site: :lax,
  httponly: true,
  secure: Rails.env.production?,
  max_age: 1.day.to_i
}
sidekiq_session_options[%i[secret].first] = Rails.application.secret_key_base

Sidekiq::Web.use Rack::Session::Cookie, sidekiq_session_options
