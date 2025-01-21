# frozen_string_literal: true

Rack::Attack.enabled = true

Rack::Attack.cache.store = Rails.cache

Rack::Attack.throttle('req/ip', limit: 500, period: 10.minutes) do |req|
  req.ip
end

