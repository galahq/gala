# frozen_string_literal: true

Rails.application.config
     .middleware
     .use PDFKit::Middleware, { dpi: 300 }, only: %r{cases/[a-z0-9-]+/archive}
