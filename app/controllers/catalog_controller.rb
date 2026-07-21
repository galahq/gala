# frozen_string_literal: true

require 'digest'

# Catalog is Gala’s root path
class CatalogController < ApplicationController
  include SelectionParams
  include PublicCatalogCache

  decorates_assigned :cases

  layout 'with_header'

  HOMEPAGE_NOSCRIPT_CASE_FIELDS = %i[slug title kicker].freeze
  HOMEPAGE_CASE_CACHE_TTL = 30.days
  HOMEPAGE_CASE_STALE_TTL = 10.minutes
  HOMEPAGE_CASE_SIGNED_IN_CACHE_TTL = 3.minutes
  HOMEPAGE_CASE_SIGNED_IN_STALE_TTL = 1.minute

  HOMEPAGE_CASE_STATS_SQL = <<~SQL.squish
    max(updated_at) AS latest
    , count(DISTINCT id) AS count
  SQL

  def self.cache_namespace
    [ENV.fetch('RAILS_ENV', 'production'), 'catalog', 'home', 'cases']
  end

  # @route [GET] `/`
  def home
    visible_cases = policy_scope(Case).ordered
    cache_signature = catalog_home_cache_signature(visible_cases)
    set_catalog_home_cache_headers

    return unless stale?(
      etag: cache_signature[:cache_etag],
      last_modified: cache_signature[:latest_at]
    )

    @cases = catalog_home_cases(visible_cases, cache_signature)
  end

  private

  def catalog_home_cases(cases_scope, cache_signature)
    Rails.cache.fetch(
      self.class.cache_namespace.concat(
        [I18n.locale, cache_signature[:cache_key], cache_signature[:reader_cache_key]]
      ).join('/'),
      expires_in: reader_signed_in? ? HOMEPAGE_CASE_SIGNED_IN_CACHE_TTL : HOMEPAGE_CASE_CACHE_TTL
    ) { cases_scope.select(*HOMEPAGE_NOSCRIPT_CASE_FIELDS).to_a.map(&:decorate) }
  end

  def catalog_home_cache_signature(cases_scope)
    stats_scope = cases_scope.unscope(:order)
    latest, count = stats_scope.pluck(Arel.sql(HOMEPAGE_CASE_STATS_SQL)).first
    set_fingerprint = catalog_home_case_set_fingerprint(stats_scope)

    latest_at = latest&.utc

    {
      latest_at: latest_at,
      cache_key: "#{latest.to_i}-#{count.to_i}-#{set_fingerprint}",
      cache_etag: [I18n.locale.to_s, latest.to_i, count.to_i, set_fingerprint].join('-'),
      reader_cache_key: reader_signed_in? ? current_reader.cache_key : 'anonymous'
    }
  end

  def catalog_home_case_set_fingerprint(cases_scope)
    case_ids = cases_scope
               .distinct
               .reorder(Case.arel_table[:id].asc)
               .pluck(:id)

    Digest::SHA256.hexdigest(case_ids.join(','))
  end

  def set_catalog_home_cache_headers
    if reader_signed_in?
      cache_ttl = HOMEPAGE_CASE_SIGNED_IN_CACHE_TTL.to_i
      stale_ttl = HOMEPAGE_CASE_SIGNED_IN_STALE_TTL.to_i
    else
      cache_ttl = HOMEPAGE_CASE_CACHE_TTL.to_i
      stale_ttl = HOMEPAGE_CASE_STALE_TTL.to_i
    end

    response.headers['Cache-Control'] =
      "public, max-age=#{cache_ttl}, s-maxage=#{cache_ttl}, stale-while-revalidate=#{stale_ttl}"
    response.headers['Vary'] = 'Accept, Accept-Language, Accept-Encoding'
  end
end
