# frozen_string_literal: true

PDFKit.configure do |config|
  config.wkhtmltopdf = '/usr/bin/wkhtmltopdf'
  config.default_options = {
    dpi: 300
  }
end
