# This file is used by Rack-based servers to start the application.

require_relative 'config/environment'

if ENV['CANONICAL_HOST']
  use Rack::CanonicalHost, ENV['CANONICAL_HOST'], cache_control: 'max-age=3600'
end

run Rails.application
