# frozen_string_literal: true

require_relative 'boot'

require 'rails/all'
require 'csv'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Orchard
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # review new_framework_defaults_6_1.rb before changing load_defaults to 6.1
    config.load_defaults 7.0
    config.active_support.cache_format_version = 7.0

    config.action_dispatch.default_headers = { 'X-Frame-Options' => 'ALLOWALL' }

    config.active_record.schema_format = :sql

    config.middleware.insert_after ActionDispatch::Static, Rack::Deflater
  end
end
