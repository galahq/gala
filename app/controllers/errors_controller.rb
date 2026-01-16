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
    return {} unless defined?(Sentry)

    {
      'eventId' => Sentry.last_event_id,
      'dsn' => sentry_dsn
    }.compact
  end
  helper_method :report_dialog_options

  def sentry_dsn
    client = Sentry.get_current_client
    dsn = client&.configuration&.dsn
    return if dsn.nil?

    host_port = dsn.port ? "#{dsn.host}:#{dsn.port}" : dsn.host
    path_segment = dsn.path.present? ? "/#{dsn.path}" : ''
    "#{dsn.scheme}://#{dsn.public_key}@#{host_port}#{path_segment}/#{dsn.project_id}"
  end
end
