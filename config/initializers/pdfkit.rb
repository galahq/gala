# frozen_string_literal: true

options = {
  dpi: 300
}

Rails.application.config
     .middleware
     .use PDFKit::Middleware, options, only: %r{cases/[a-z0-9-]+/archive}
