# frozen_string_literal: true

posthog_api_key = ENV['POSTHOG_API_KEY'].to_s.strip
posthog_host = ENV.fetch('POSTHOG_HOST', 'https://us.i.posthog.com')

if posthog_api_key.blank?
  Rails.logger.info('PostHog disabled: POSTHOG_API_KEY is not set')
else
  PostHog.init do |config|
    config.api_key = posthog_api_key
    config.host = posthog_host
    config.personal_api_key = ENV['POSTHOG_PERSONAL_API_KEY'] if ENV['POSTHOG_PERSONAL_API_KEY'].present?
    config.test_mode = Rails.env.test?
    config.max_queue_size = 10_000

    config.on_error = proc do |status, msg|
      Rails.logger.error("PostHog error (#{status}): #{msg}") if msg.present?
    end
  end

  PostHog::Rails.configure do |config|
    config.auto_capture_exceptions = true
    config.report_rescued_exceptions = true
    config.auto_instrument_active_job = true
    config.use_tracing_headers = true
    config.capture_user_context = true
    config.current_user_method = :current_user
  end
end
