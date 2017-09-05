Rails.application.configure do
  config.lograge.enabled = true
  config.lograge.formatter = ->(data) {
    ap data, multiline: false
  }
end
