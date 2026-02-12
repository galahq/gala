# frozen_string_literal: true

# Legacy compatibility shim.
# Prefer CountryReference for new code.
module FindCountry
  module_function

  UNKNOWN_COUNTRY = CountryReference::UNKNOWN_COUNTRY
  COUNTRY_DATA = CountryReference::COUNTRY_DATA
  ISO2_TO_ISO3 = CountryReference::ISO2_TO_ISO3
  ISO3_TO_ISO2 = CountryReference::ISO3_TO_ISO2

  def normalize_name(value)
    CountryReference.normalize_name(value)
  end

  def resolve(value)
    CountryReference.resolve(value)
  end

  def unknown?(value)
    CountryReference.unknown?(value)
  end
end
