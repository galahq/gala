# frozen_string_literal: true

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  config.web_console.whitelisted_ips = '172.16.0.0/12'

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports.
  config.consider_all_requests_local = true

  # Enable/disable caching. By default caching is disabled.
  if Rails.root.join('tmp/caching-dev.txt').exist?
    config.action_controller.perform_caching = true

    config.cache_store = :memory_store
    config.public_file_server.headers = {
      'Cache-Control' => 'public, max-age=172800'
    }
  else
    config.action_controller.perform_caching = false

    config.cache_store = :null_store
  end

  config.action_mailer.delivery_method = :letter_opener
  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.perform_caching = false

  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  config.debug_exception_response_format = :api

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  config.file_watcher = ActiveSupport::EventedFileUpdateChecker

  config.after_initialize do
    Bullet.enable = true
    Bullet.console = true
  end

  if ENV['LOCALHOST_SSL'].present?
    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger = ActiveSupport::TaggedLogging.new(logger)
  end

  OmniAuth.config.test_mode = true
  auth_hash = { provider: 'google_oauth2', uid: '1234567890',
                info: {
                  name: 'Developer Admin',
                  email: 'dev@learnmsc.org',
                  first_name: 'Developer',
                  last_name: 'Admin'
                },
                extra: {
                  raw_info: {
                    sub: '123456789',
                    email: 'dev@learnmsc.org',
                    email_verified: true,
                    name: 'Developer Admin',
                    given_name: 'Developer',
                    family_name: 'Admin',
                    locale: 'en'
                  }
                } }
  DEV_MOCK_AUTH_HASH = OmniAuth::AuthHash.new auth_hash
  OmniAuth.config.mock_auth[:google] = DEV_MOCK_AUTH_HASH
end
