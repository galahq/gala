# frozen_string_literal: true

options = {
  dpi: 300
}

if Rails.env.production?
  options.merge!(
    protocol: 'https',
    root_url: 'https://www.learngala.com/'
  )
end

Rails.application.config
     .middleware
     .use PDFKit::Middleware, options, only: %r{cases/[a-z0-9-]+/archive}
