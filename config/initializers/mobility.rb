# frozen_string_literal: true

Mobility.configure do |config|
  config.default_backend = :jsonb
  config.accessor_method = :translates
  config.query_method    = :i18n
  config.default_options[:locale_accessors] = true
end
