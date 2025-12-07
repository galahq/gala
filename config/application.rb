# frozen_string_literal: true

require_relative 'boot'

require 'rails/all'
require 'csv'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

# Set release version
ENV['RELEASE'] = 'v2.2.0' # TODO: experiment doing github releases again

# Normalize an env flag to string 'true'/'false', using a fallback block.
def normalized_env_flag(value)
  if value && !value.strip.empty?
    value.to_s.downcase == 'true' ? 'true' : 'false'
  else
    yield ? 'true' : 'false'
  end
end

# Determine if we're in staging environment
staging_env_source = ENV['STAGING']
STAGING_ENV =
  normalized_env_flag(staging_env_source) do
    ENV['BASE_URL'].to_s.include?('staging')
  end
ENV['STAGING'] = STAGING_ENV

# Determine if temporary unconfirmed access is allowed
temporary_access_source = ENV['TEMPORARY_UNCONFIRMED_ACCESS']
TEMPORARY_UNCONFIRMED_ACCESS =
  normalized_env_flag(temporary_access_source) do
    STAGING_ENV == 'true'
  end
ENV['TEMPORARY_UNCONFIRMED_ACCESS'] = TEMPORARY_UNCONFIRMED_ACCESS

module Orchard
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    config.load_defaults 7.0
    config.active_support.cache_format_version = 7.0

    config.x.staging_env = STAGING_ENV
    config.x.temporary_unconfirmed_access = TEMPORARY_UNCONFIRMED_ACCESS

    config.action_dispatch.default_headers = { 'X-Frame-Options' => 'ALLOWALL' }

    config.active_record.schema_format = :sql

    # Use compression middleware only in web (Puma) processes
    # Sidekiq.server? is true when running inside a Sidekiq process
    config.middleware.use Rack::Deflater unless defined?(Sidekiq) && Sidekiq.server?
  end
end
