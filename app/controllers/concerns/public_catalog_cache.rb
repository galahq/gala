# frozen_string_literal: true

# Shared cache policy for anonymous catalog JSON endpoints that are safe to
# serve from the Rails cache and CloudFront.
module PublicCatalogCache
  extend ActiveSupport::Concern

  PUBLIC_CATALOG_CACHE_TTL = 1.minute
  PUBLIC_CATALOG_STALE_TTL = 30.seconds

  private

  def anonymous_json_catalog_request?(allow_query: false)
    return false if reader_signed_in?
    return false unless request.format.json?
    return true if allow_query

    request.query_parameters.except(:locale, 'locale').empty?
  end

  def catalog_cache_timestamp(scope)
    scope.maximum(:updated_at)&.utc&.to_i || 0
  end

  def render_public_catalog_json(cache_key, **render_options)
    set_public_catalog_cache_headers
    render body: Rails.cache.fetch(cache_key, expires_in: PUBLIC_CATALOG_CACHE_TTL) {
      render_to_string(**render_options)
    }, content_type: 'application/json'
  end

  def set_public_catalog_cache_headers
    ttl = PUBLIC_CATALOG_CACHE_TTL.to_i
    stale_ttl = PUBLIC_CATALOG_STALE_TTL.to_i
    response.headers['Cache-Control'] =
      "public, max-age=#{ttl}, s-maxage=#{ttl}, stale-while-revalidate=#{stale_ttl}"
    response.headers['Vary'] = 'Accept, Accept-Language, Accept-Encoding'
  end
end
