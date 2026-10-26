# frozen_string_literal: true

Rails.application.configure do
  config.lograge.enabled = true

  # Link expansion requests are most of Gala's traffic, and each one carries
  # the edgenote's full URL. The edgenote slug is enough to find it again.
  quiet_params = {
    'Edgenotes::LinkExpansionsController' => %w[href updatedAt]
  }

  config.lograge.custom_options = ->(event) do
    exceptions = %w[controller action format id] +
                 quiet_params.fetch(event.payload[:controller], [])
    { params: event.payload[:params]&.except(*exceptions) }
  end

  config.lograge.formatter = ->(data) {
    "👋  #{data.inspect}"
  }
end
