# frozen_string_literal: true

is_staging = ENV['BASE_URL'].present? && ENV['BASE_URL'].include?('staging')

Rack::Attack.enabled = Rails.env.production? && !is_staging

Rack::Attack.cache.store = Rails.cache

Rack::Attack.throttle('req/ip', limit: 500, period: 1.minute.to_i) do |req|
  req.ip
end

