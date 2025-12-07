# frozen_string_literal: true

Rack::Attack.enabled = true
Rack::Attack.cache.store = Rails.cache

Rack::Attack.blocklist('invalid-case-url-depth') do |req|
  next unless req.path.start_with?('/cases/')

  # Block paths like /cases/:slug/1/2/3 where more than one numeric segment
  # trails the slug (valid requests only include a single page segment).
  path_segments = req.path.delete_prefix('/cases/').split('/')
  slug, *rest = path_segments
  next if slug.blank? || rest.blank?

  numeric_depth = rest.take_while { |segment| segment.match?(/\A\d+\z/) }.size
  blocked = numeric_depth > 1

  if blocked && defined?(Sentry)
    Sentry.capture_message(
      'Rack::Attack blocked malformed case path',
      level: :warning,
      extra: {
        path: req.path,
        ip: req.ip,
        query: req.get_header('QUERY_STRING'),
        user_agent: req.user_agent
      }
    )
  end

  blocked
end

blocklisted_responder = ->(_env) do
  [404, { 'Content-Type' => 'text/plain' }, ["Not Found\n"]]
end

if Rack::Attack.respond_to?(:blocklisted_responder=)
  Rack::Attack.blocklisted_responder = blocklisted_responder
else
  Rack::Attack.blocklisted_response = blocklisted_responder
end

Rack::Attack.throttle('req/ip', limit: 500, period: 1.minute.to_i, &:ip)
