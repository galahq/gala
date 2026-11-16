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
# The data is DB-IP's IP to Country Lite under CC BY 4.0. The credit in the
# site footer is a condition of that licence, not decoration.
class GeoIp
  DATABASE_PATH = Rails.root.join('db/geoip/dbip-country-lite.mmdb')

  class << self
    # @param ip [String, nil] an address, already masked to a /24 or /48 by Ahoy
    # @return [String, nil] an ISO 3166-1 alpha-2 code — what ipinfo.io
    #   returned, and so what every existing +visits.country+ row holds. nil
    #   for private and unallocated ranges, a malformed address, or a missing
    #   database file.
    def country_code(ip)
      return if ip.blank?

      reader&.get(ip.to_s)&.dig('country', 'iso_code').presence
    rescue IPAddr::InvalidAddressError
      nil
    end

    # @return [Time, nil] when this copy of the database was built. Countries
    #   move slowly, but a copy years old is worth noticing.
    def built_at
      epoch = reader&.metadata&.build_epoch
      Time.zone.at(epoch) if epoch
    end

    private

    # MODE_MEMORY because Puma forks, and the reader is only safe across a
    # fork in that mode. Costs roughly 8 MB in each worker process.
    def reader
      return @reader if defined?(@reader)

      @reader =
        (MaxMind::DB.new(DATABASE_PATH.to_s, mode: MaxMind::DB::MODE_MEMORY) if DATABASE_PATH.exist?)
    end
  end
end
