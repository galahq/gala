# frozen_string_literal: true

# BASE_URL for production and staging:
#  production: https://www.learngala.com
#     staging: https://msc-gala-staging.herokuapp.com

BASE_URL_HOST = ENV['BASE_URL']&.gsub(%r{^https?://}, '')

Rails.application.routes.default_url_options = { host: BASE_URL_HOST }

Rails.application.configure do
  # Prepare the ingress controller used to receive mail
  # config.action_mailbox.ingress = :amazon

  # Settings specified here will take precedence over those in
  # config/application.rb.

  # Code is not reloaded between requests.
  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both threaded web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Ensures that a master key has been made available in either
  # ENV["RAILS_MASTER_KEY"] or in config/master.key. This key is used to decrypt
  # credentials (and other encrypted files).
  # config.require_master_key = true

  # Disable serving static files from the `/public` folder by default since
  # Apache or NGINX already handles this.
  config.public_file_server.enabled = ENV['RAILS_SERVE_STATIC_FILES'].present?
  config.public_file_server.headers = {
    'Cache-Control' => 'public, s-maxage=31536000, maxage=15552000',
    'Expires' => 1.year.from_now.to_formatted_s(:rfc822).to_s
  }

  # Do not fallback to assets pipeline if a precompiled asset is missed.
  config.assets.compile = false

  # `config.assets.precompile` and `config.assets.version` have moved to
  # config/initializers/assets.rb

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.action_controller.asset_host = 'http://assets.example.com'

  config.assets.css_compressor = :sass

  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = 'X-Sendfile' # for Apache
  # config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect' # for NGINX

  # Action Cable endpoint configuration
  config.action_cable.url = "wss://#{BASE_URL_HOST}/cable"
  config.action_cable.allowed_request_origins = [
    "http://#{BASE_URL_HOST}",
    "https://#{BASE_URL_HOST}"
  ]

  # Store uploaded files on the local file system (see config/storage.yml for
  # options)
  config.active_storage.service = :amazon

  # Force all access to the app over SSL, use Strict-Transport-Security, and use
  # secure cookies.
  config.force_ssl = true unless ENV['DOCKER_DEV'].present?

  # Use the lowest log level to ensure availability of diagnostic information
  # when problems arise.
  config.logger = Logger.new(STDOUT)
  config.log_level = :debug

  # Prepend all log lines with the following tags.
  config.log_tags = [:request_id]

  config.cache_store = :redis_cache_store, {
    url: ENV.fetch('REDIS_URL') { 'redis://redis:6379/0' },
    namespace: 'cache',
    ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE }
  }

  # Use a real queuing backend for Active Job (and separate queues per
  # environment)
  config.active_job.queue_adapter = :sidekiq

  config.action_mailer.perform_caching = false

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to
  # raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false

  config.action_mailer.default_url_options = { host: BASE_URL_HOST }

  if ENV['SES_SMTP_USERNAME'] && ENV['SES_SMTP_PASSWORD']
    config.action_mailer.smtp_settings = {
      address: 'email-smtp.us-west-2.amazonaws.com',
      port: 587,
      user_name: ENV['SES_SMTP_USERNAME'],
      password: ENV['SES_SMTP_PASSWORD'],
      authentication: :login,
      enable_starttls_auto: true
    }
  else
    config.action_mailer.raise_delivery_errors = false
  end

  config.action_mailbox.ingress = :amazon

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = [I18n.default_locale]

  # Send deprecation notices to registered listeners.
  config.active_support.deprecation = :notify

  # Use default logging formatter so that PID and timestamp are not suppressed.
  config.log_formatter = ::Logger::Formatter.new

  if ENV['RAILS_LOG_TO_STDOUT'].present?
    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger    = ActiveSupport::TaggedLogging.new(logger)
  end

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false
end
