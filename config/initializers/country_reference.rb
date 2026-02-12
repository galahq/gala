# frozen_string_literal: true

require 'json'

COUNTRY_REFERENCE_DATA = begin
  path = Rails.root.join('config/country_reference.json')
  parsed = JSON.parse(File.read(path))
  parsed.each_value(&:freeze)
  parsed.freeze
end

def country_reference_data
  COUNTRY_REFERENCE_DATA
end
