# frozen_string_literal: true

Ahoy.api = true
Ahoy.server_side_visits = false

# Ahoy's own geocoding sends every visitor's address to ipinfo.io through
# Geocoder. Gala resolves the country from a local database instead, in
# Ahoy::Store#track_visit below, so no address leaves the dyno.
Ahoy.geocode = false

class Ahoy::Store < Ahoy::DatabaseStore
  def user
    controller.current_reader
  end

  def visit_model
    Visit
  end

  # Sets the country as the visit is created, from the address Ahoy has
  # already masked. Stores an ISO 3166-1 alpha-2 code, matching every row
  # written while ipinfo.io was doing the lookup.
  def track_visit(data)
    super(data.merge(country: GeoIp.country_code(data[:ip])))
  end
end

Ahoy.mask_ips = true
Ahoy.cookies = false
