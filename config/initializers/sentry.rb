# frozen_string_literal: true

return if Rails.env.test? || Rails.env.development?

begin
  require 'vernier'
rescue LoadError
  Rails.logger.warn('Vernier gem is not available for Sentry profiling') if
    defined?(Rails)
end

sentry_dsn =
  ENV['SENTRY_DSN'].presence ||
  'https://da1bc9fe1d2e4fd89349d6ff82fca30e@sentry.io/1309103'

traces_sample_rate =
  ENV.fetch('SENTRY_TRACES_SAMPLE_RATE', 0.0).to_f

profiles_sample_rate =
  ENV.fetch('SENTRY_PROFILES_SAMPLE_RATE', traces_sample_rate).to_f

Sentry.init do |config|
  config.dsn = sentry_dsn
  config.environment = ENV.fetch('SENTRY_ENVIRONMENT', Rails.env)

  # Sentry needs a value that changes on every deploy, or "first seen in
  # release", regression detection and release comparison are all inert.
  #
  # ENV['RELEASE'] cannot serve that purpose: it is the human-facing version set
  # in config/application.rb, and it drives the footer's GitHub release link and
  # the gala-release meta tag, so it is deliberately static between releases.
  #
  # Prefer the deployed commit — unique per deploy and maps back to source.
  # Heroku exposes HEROKU_SLUG_COMMIT / HEROKU_RELEASE_VERSION only when
  # runtime-dyno-metadata is enabled (currently on for msc-gala, off for
  # msc-gala-staging), so fall back rather than reporting nothing.
  config.release = ENV['SENTRY_RELEASE'].presence ||
                   ENV['HEROKU_SLUG_COMMIT'].presence ||
                   ENV['HEROKU_RELEASE_VERSION'].presence ||
                   ENV['RELEASE']
  config.enabled_environments = %w[production staging]
  # Off everywhere. With this on, the SDK attaches the raw form body, cookies
  # and client IP to every event, bypassing Rails filter_parameters, so a
  # failed sign-in shipped the email and password under request.data. Off, an
  # event still carries the URL, headers minus Authorization, request_id and
  # the reader id set in ApplicationController#set_sentry_context.
  config.send_default_pii = false

  # Needed for structured logs per https://docs.sentry.io/platforms/ruby/logs/
  config.enable_logs = true

  # enable_logs also switches on sentry-rails structured logging with its two
  # default subscribers. The active_record one ships every SQL statement's
  # text to Sentry Logs; bound values are placeholders, but queries built with
  # inline literals (FindReaders' ILIKE on a searched name) are not. Keep the
  # request-level controller events, drop the SQL firehose.
  config.rails.structured_logging.subscribers.delete(:active_record)

  # With send_default_pii off the SDK drops the query string from the request
  # URL, but not from the Referer header. After a reset-password page, the
  # follow-up PUT carries that page's URL, token included, in its Referer.
  config.before_send = ->(event, _hint) do
    referer = event.request&.headers&.[]('Referer')
    event.request.headers['Referer'] = referer.split('?').first if referer
    event
  end

  # :active_support_logger is deliberately absent — it subscribes to every
  # ActiveSupport notification (including per-SQL events) regardless of log
  # level and churns a large breadcrumb ring buffer on every request.
  config.breadcrumbs_logger = %i[http_logger]
  config.traces_sample_rate = traces_sample_rate
  config.profiles_sample_rate = profiles_sample_rate
  config.profiler_class = Sentry::Vernier::Profiler

  if config.respond_to?(:sdk_logger=)
    config.sdk_logger = Rails.logger
  else
    config.logger = Rails.logger
  end
end
