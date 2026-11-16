# frozen_string_literal: true

# Resolves an IP address to a country using a database file that ships in the
# slug, so a visitor's address never leaves the dyno.
#
# This replaces the lookup Ahoy performs by default, which sends every address
# to ipinfo.io through Geocoder — an undisclosed recipient with no processing
# agreement (register item 4, A5). The file holds countries and nothing else,
# so there is no city, postal code or coordinate left for anything to collect
# by accident.
#
# The data is DB-IP's IP to Country Lite under CC BY 4.0. The credit on the
# stats page and in the site footer is a condition of that licence.
class GeoIp
  DATABASE_PATH = Rails.root.join('db/geoip/dbip-country-lite.mmdb')
  MUTEX = Mutex.new

  class << self
    # @param ip [String, nil] an address, already masked to a /24 or /48 by Ahoy
    # @return [String, nil] an ISO 3166-1 alpha-2 code — what ipinfo.io
    #   returned, and so what every existing +visits.country+ row holds. nil
    #   for private and unallocated ranges, a malformed address, or a missing
    #   database file.
    def country_code(ip)
      return if ip.blank?

      reader&.get(ip.to_s)&.dig('country', 'iso_code').presence
    rescue StandardError => e
      # Ahoy::Store#track_visit calls this inline, and Ahoy drops the whole
      # visit if it raises — so enrichment must never cost the record it was
      # enriching. MaxMind::DB raises ArgumentError for an IPv6 address in an
      # IPv4-only database and InvalidDatabaseError for a truncated file.
      # The class only: an address does not belong in the log.
      Rails.logger.warn "[geo_ip] lookup failed: #{e.class}"
      nil
    end

    # @return [Time, nil] when this copy of the database was built. Countries
    #   move slowly, but a copy years old is worth noticing.
    def built_at
      epoch = reader&.metadata&.build_epoch
      Time.zone.at(epoch) if epoch
    end

    # Builds the reader up front. config/puma.rb calls this before forking so
    # the 8 MB sits in the master and stays copy-on-write-shared, rather than
    # each worker paying for a private copy on its first visit.
    def warm!
      reader
      true
    end

    private

    def reader
      return @reader if defined?(@reader)

      MUTEX.synchronize do
        @reader = build_reader unless defined?(@reader)
      end
      @reader
    end

    # MODE_MEMORY because the reader is only safe across a fork in that mode,
    # and warm! builds it before Puma forks.
    def build_reader
      unless DATABASE_PATH.exist?
        Rails.logger.warn "[geo_ip] #{DATABASE_PATH} is missing; visits will record no country"
        return
      end

      MaxMind::DB.new(DATABASE_PATH.to_s, mode: MaxMind::DB::MODE_MEMORY)
    rescue StandardError => e
      Rails.logger.error "[geo_ip] could not open #{DATABASE_PATH}: #{e.class}"
      nil
    end
  end
end
