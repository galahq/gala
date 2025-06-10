# frozen_string_literal: true

require_relative 'boot'

require 'rails/all'
require 'csv'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

# Set release version
ENV['RELEASE'] = 'v2.2.0' # TODO: experiment doing github releases again

# Determine if we're in staging environment
ENV['STAGING'] = (ENV['BASE_URL']&.include?('staging')).to_s

# Allow temporary unconfirmed access in staging or development
ENV['TEMPORARY_UNCONFIRMED_ACCESS'] ||=
  (ENV['STAGING'] == 'true').to_s

module Orchard
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    config.load_defaults 7.0
    config.active_support.cache_format_version = 7.0

    config.action_dispatch.default_headers = { 'X-Frame-Options' => 'ALLOWALL' }

    config.active_record.schema_format = :sql

    unless ENV['SIDEKIQ_CONCURRENCY'].present?
      config.middleware.use Rack::Deflater
    end
  end
end
