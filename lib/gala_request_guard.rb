# frozen_string_literal: true

class GalaRequestGuard
  DEFAULT_THROTTLE_LIMIT = 500
  DEFAULT_THROTTLE_PERIOD = 60

  def initialize(app, cache: -> { Rails.cache }, logger: -> { Rails.logger },
                 limit: DEFAULT_THROTTLE_LIMIT, period: DEFAULT_THROTTLE_PERIOD)
    @app = app
    @cache = cache
    @logger = logger
    @limit = limit
    @period = period
  end

  def call(env)
    request = Rack::Request.new(env)

    return not_found_response if invalid_case_url_depth?(request)
    return throttled_response if throttled?(request)

    @app.call(env)
  end

  private

  attr_reader :cache, :logger, :limit, :period

  def invalid_case_url_depth?(request)
    return false unless request.path.start_with?('/cases/')

    path_segments = request.path.delete_prefix('/cases/').split('/')
    slug, *rest = path_segments
    return false if slug.nil? || slug.empty? || rest.empty?

    numeric_depth = rest.take_while { |segment| segment.match?(/\A\d+\z/) }.size
    blocked = numeric_depth > 1

    log_invalid_case_path(request) if blocked

    blocked
  end

  def throttled?(request)
    count = increment_throttle_count(throttle_key(request))

    count > limit
  end

  def throttle_key(request)
    window = Time.now.to_i / period
    "gala_request_guard:req/ip:#{request.ip}:#{window}"
  end

  def increment_throttle_count(key)
    cache_store = cache.call
    count = cache_store.increment(key, 1, expires_in: period)
    return count if count

    count = cache_store.read(key).to_i + 1
    cache_store.write(key, count, expires_in: period)
    count
  end

  def log_invalid_case_path(request)
    logger.call.warn(
      'GalaRequestGuard blocked malformed case path ' \
      "(path=#{request.path}, ip=#{request.ip}, query=#{request.query_string}, " \
      "ua=#{request.user_agent})"
    )
  end

  def not_found_response
    [404, { 'Content-Type' => 'text/plain' }, ["Not Found\n"]]
  end

  def throttled_response
    [429, { 'Content-Type' => 'text/plain' }, ["Retry later\n"]]
  end
end
