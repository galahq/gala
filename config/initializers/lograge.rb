# frozen_string_literal: true

Rails.application.configure do
  config.lograge.enabled = true

  require Rails.root.join('vendor', 'ruby', 'lograge_payload_formatter')

  config.lograge.custom_options = ->(event) do
    exceptions = %w[controller action format id]
    { params: event.payload[:params]&.except(*exceptions) }
  end

  config.lograge.formatter = ->(data) {
    details = LogragePayloadFormatter.format(data)
    "👋  #{details}"
  }
end
