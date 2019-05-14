# frozen_string_literal: true

PDFKit.configure do |config|
  config.default_options = {
    dpi: 300,
    margin_left: '1.5in',
    margin_right: '1.5in'
  }
end
