# frozen_string_literal: true

Rails.application.routes.default_url_options = { host: 'localhost', port: 3000 }

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Check if we use Docker to allow docker ip through web-console
  if File.file?('/.dockerenv') == true
    ip_address = Socket.ip_address_list.find(&:ipv4_private?).ip_address
    ip_obj = IPAddr.new(ip_address.to_s)
    cidr_notation = "#{ip_obj.to_s}/#{ip_obj.to_range.to_a.size.to_s(2).count('1')}"
    config.web_console.whitelisted_ips = cidr_notation
  end

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports.
  config.consider_all_requests_local = true

  config.public_file_server.enabled

  config.active_job.queue_adapter = :inline

  # Enable/disable caching. By default caching is disabled.
  # Run rails dev:cache to toggle caching.
  # if Rails.root.join('tmp', 'caching-dev.txt').exist?
  #   config.action_controller.perform_caching = true
  #   config.action_controller.enable_fragment_cache_logging = true
  #
  #   config.cache_store = :memory_store
  #   config.public_file_server.headers = {
  #     'Cache-Control' => "public, max-age=#{2.days.to_i}"
  #   }
  # else
  #   config.action_controller.perform_caching = false
  #
  #   config.cache_store = :null_store
  # end

  config.action_mailer.delivery_method = :letter_opener

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

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Suppress logger output for asset requests.
  config.assets.quiet = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  config.file_watcher = ActiveSupport::EventedFileUpdateChecker

  # config.after_initialize do
  #   Bullet.enable = true
  #   Bullet.console = true
  # end

  # if ENV['LOCALHOST_SSL'].present?
  #   logger           = ActiveSupport::Logger.new(STDOUT)
  #   logger.formatter = config.log_formatter
  #   config.logger = ActiveSupport::TaggedLogging.new(logger)
  # end
end
