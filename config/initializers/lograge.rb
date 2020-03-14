# frozen_string_literal: true

Rails.application.configure do
  config.lograge.enabled = true

  config.lograge.custom_options = ->(event) do
    exceptions = %w[controller action format id]
    { params: event.payload[:params]&.except(*exceptions) }
  end

  config.lograge.formatter = ->(data) {
    details = data.awesome_inspect multiline: !Rails.env.production?
    "👋  #{details}"
  }
end
