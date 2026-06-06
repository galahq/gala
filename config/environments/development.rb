# frozen_string_literal: true

Rails.application.routes.default_url_options = { host: 'localhost', port: 3000 }

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports.
  config.consider_all_requests_local = true

  config.public_file_server.enabled

  config.active_job.queue_adapter = :sidekiq
  config.action_cable.mount_path = nil
  config.action_cable.url = ENV.fetch('ANYCABLE_WEBSOCKET_URL') do
    "ws://localhost:#{ENV.fetch('ANYCABLE_HOST_PORT', '3002')}/cable"
  end
  config.action_cable.allowed_request_origins = [
    %r{\Ahttp://localhost(?::\d+)?\z},
    %r{\Ahttp://127\.0\.0\.1(?::\d+)?\z}
  ]

  # Enable/disable caching. By default caching is disabled.
  # Run rails dev:cache to toggle caching.
  # NP 2025 - caching is enabled by default in development
  config.action_controller.perform_caching = true
  config.action_controller.enable_fragment_cache_logging = true
  config.cache_store = :redis_cache_store, {
    url: ENV.fetch('REDIS_URL') { 'redis://localhost:6379/0' },
    namespace: 'cache',
    ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE }
  }

  config.action_mailer.delivery_method = Gem.loaded_specs.key?('letter_opener') ? :letter_opener : :smtp

  # Store uploaded files on the local file system (see config/storage.yml for
  # options)
  config.active_storage.service = :local

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.perform_caching = false

  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Highlight code that triggered database queries in logs.
  config.active_record.verbose_query_logs = true

  # Suppress logger output for asset requests.
  config.assets.quiet = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  config.file_watcher = if Gem.loaded_specs.key?('listen')
    ActiveSupport::EventedFileUpdateChecker
  else
    ActiveSupport::FileUpdateChecker
  end

  # config.after_initialize do
  #   Bullet.enable = true
  #   Bullet.console = true
  # end

  if ENV['RAILS_LOG_TO_STDOUT'].present?
    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger = ActiveSupport::TaggedLogging.new(logger)
  end

  # Allow all hosts
  config.hosts.clear

  # Allow web console from all IPs
  config.web_console.allowed_ips = '0.0.0.0/0' if config.respond_to?(:web_console)
end
