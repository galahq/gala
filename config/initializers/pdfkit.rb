# frozen_string_literal: true

options = {
  dpi: 300,
  margin_left: '1.5in',
  margin_right: '1.5in'
}

Rails.application.config
     .middleware
     .use PDFKit::Middleware, options, only: %r{cases/[a-z0-9-]+/archive}
