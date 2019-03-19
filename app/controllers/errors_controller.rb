# frozen_string_literal: true

# Handle errors
class ErrorsController < ActionController::Base
  def self.method_name(code)
    Rack::Utils::HTTP_STATUS_CODES[code].encode('utf-8').parameterize.underscore
  end

  layout 'window'

  [403, 404, 422, 500].each do |err|
    define_method :"#{method_name err}" do
      respond_to do |format|
        format.html { render status: err }
        format.json { render json: { error: error_message(err) }, status: err }
        format.any  { render text: error_message(err), status: err }
      end
    end
  end

  private

  def error_message(code)
    "#{code} #{Rack::Utils::HTTP_STATUS_CODES[code]}"
  end

  def report_dialog_options
    {
      'eventId' => Raven.last_event_id,
      'dsn' => sentry_dsn
    }
  end
  helper_method :report_dialog_options

  def sentry_dsn
    return unless ENV['SENTRY_DSN'].present?

    ENV['SENTRY_DSN'].gsub %r{^https://([^:]+):[^@]+(.*)}, 'https://\1\2'
  end
end
