# frozen_string_literal: true

# Shared cache policy for catalog JSON endpoints that are safe to
# serve from the Rails cache and CloudFront.
module PublicCatalogCache
  extend ActiveSupport::Concern

  PUBLIC_CATALOG_ANONYMOUS_CACHE_TTL = 30.days
  PUBLIC_CATALOG_ANONYMOUS_STALE_TTL = 10.minutes
  PUBLIC_CATALOG_SIGNED_IN_CACHE_TTL = 5.minutes
  PUBLIC_CATALOG_SIGNED_IN_STALE_TTL = 1.minute

  private

  def anonymous_json_catalog_request?(allow_query: false)
    return false unless request.format.json?
    return true if allow_query

    request.query_parameters.except(:locale, 'locale').empty?
  end

  def catalog_cache_timestamp(scope)
    timestamp = scope.maximum(:updated_at)
    timestamp ? timestamp.to_i : 0
  end

  def render_public_catalog_json(cache_key, **render_options)
    request.session_options[:skip] = true unless reader_signed_in?
    set_public_catalog_cache_headers
    render(
      body: Rails.cache.fetch(
        public_catalog_cache_key(cache_key),
        expires_in: public_catalog_cache_ttl
      ) { render_to_string(**render_options) },
      content_type: 'application/json'
    )
  end

  def set_public_catalog_cache_headers
    ttl = public_catalog_cache_ttl.to_i
    stale_ttl = public_catalog_stale_ttl.to_i

    response.headers['Cache-Control'] = if reader_signed_in?
                                          'private, no-store'
                                        else
                                          "public, max-age=0, s-maxage=#{ttl}, " \
                                            "stale-while-revalidate=#{stale_ttl}"
                                        end
    response.headers['Vary'] = 'Accept, Accept-Language, Accept-Encoding, Cookie'
  end

  def public_catalog_cache_ttl
    return PUBLIC_CATALOG_SIGNED_IN_CACHE_TTL if reader_signed_in?

    PUBLIC_CATALOG_ANONYMOUS_CACHE_TTL
  end

  def public_catalog_stale_ttl
    return PUBLIC_CATALOG_SIGNED_IN_STALE_TTL if reader_signed_in?

    PUBLIC_CATALOG_ANONYMOUS_STALE_TTL
  end

  def public_catalog_cache_key(cache_key)
    public_key = public_catalog_cache_key_base.dup
    public_key << (reader_signed_in? ? current_reader.cache_key : 'anonymous')
    public_key.concat(Array(cache_key))
    public_key.join('/')
  end

  def public_catalog_cache_key_base
    [ENV.fetch('RAILS_ENV', 'production'), 'catalog']
  end
end
