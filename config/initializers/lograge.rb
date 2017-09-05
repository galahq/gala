# frozen_string_literal: true

Rails.application.configure do
  config.lograge.enabled = true
  config.lograge.formatter = ->(data) {
    data.awesome_inspect multiline: false
  }
end
