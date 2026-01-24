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
  config.release = ENV['RELEASE']
  config.enabled_environments = %w[production staging]
  config.send_default_pii = Rails.env.production?

  # Needed for structured logs per https://docs.sentry.io/platforms/ruby/logs/
  config.enable_logs = true

  config.breadcrumbs_logger = %i[active_support_logger http_logger]
  config.traces_sample_rate = traces_sample_rate
  config.profiles_sample_rate = profiles_sample_rate
  config.profiler_class = Sentry::Vernier::Profiler

  if config.respond_to?(:sdk_logger=)
    config.sdk_logger = Rails.logger
  else
    config.logger = Rails.logger
  end
end
