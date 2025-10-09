# frozen_string_literal: true

is_staging = ENV['BASE_URL'].present? && ENV['BASE_URL'].include?('staging')

Rack::Attack.enabled = false # Rails.env.production? && !is_staging

Rack::Attack.cache.store = Rails.cache

Rack::Attack.throttle('req/ip', limit: 500, period: 1.minute.to_i) do |req|
  req.ip
end

Rack::Attack.throttle('github_pages/ip', limit: 100, period: 1.minute) do |req|
  req.ip if req.path.start_with?('/github_pages')
end