Mobility.configure do |config|
  config.default_backend = :jsonb
  config.accessor_method = :translates
  config.query_method    = :i18n
  # TODO: Deal with fallbacks...
end
