# frozen_string_literal: true

require 'uri'

# Keep Active Storage direct uploads usable when browsers make cross-origin requests
# (for example, CI smoke reader uploads from a separate preview domain).
class ActiveStorageCors
  ACTIVE_STORAGE_PREFIX = '/rails/active_storage/'.freeze
  DEFAULT_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://localhost:3035',
    'https://localhost:3035'
  ].freeze
  CORS_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  CORS_REQUESTED_HEADERS =
    'Authorization, Content-Type, X-CSRF-Token, X-Requested-With'.freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)
    return @app.call(env) unless request.path.start_with?(ACTIVE_STORAGE_PREFIX)

    cors_headers = build_cors_headers(request)
    return @app.call(env) unless cors_headers

    return [Rack::Utils::SYMBOL_TO_STATUS_CODE[:no_content], cors_headers, []] if request.options?

    status, headers, body = @app.call(env)
    [status, headers.merge(cors_headers), body]
  end

  private

  def build_cors_headers(request)
    origin = request.get_header('HTTP_ORIGIN')
    return nil unless origin && origin_allowed?(origin, request.host)

    allowed_headers = request.get_header('HTTP_ACCESS_CONTROL_REQUEST_HEADERS')
    {
      'Access-Control-Allow-Origin' => origin,
      'Access-Control-Allow-Methods' => CORS_METHODS,
      'Access-Control-Allow-Headers' => allowed_headers.presence || CORS_REQUESTED_HEADERS,
      'Access-Control-Max-Age' => '86400',
      'Vary' => 'Origin'
    }
  end

  def origin_allowed?(origin, request_host)
    parsed = parse_origin(origin)
    return false unless parsed

    host = parsed.host
    return false unless host

    return true if host == request_host
    return true if explicit_allowed_origins.include?(origin)
    return true if host == root_domain
    return true if host == "www.#{root_domain}"
    return true if host == "dev.#{root_domain}"
    return true if host.end_with?(".dev.#{root_domain}")

    false
  end

  def parse_origin(origin)
    URI.parse(origin)
  rescue URI::InvalidURIError
    nil
  end

  def explicit_allowed_origins
    @explicit_allowed_origins ||= begin
      origins = ENV.fetch('ACTIVE_STORAGE_CORS_ORIGINS', '')
                    .split(',')
                    .map(&:strip)
                    .reject(&:empty?)
      (origins + DEFAULT_ALLOWED_ORIGINS).uniq
    end
  end

  def root_domain
    @root_domain ||= ENV.fetch('GALA_DOMAIN_NAME', 'learngala.dev').to_s.strip
  end
end

Rails.application.config.middleware.insert_before 0, ActiveStorageCors
