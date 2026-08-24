# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path
# Add node_modules to the asset load path.
Rails.application.config.assets.paths << Rails.root.join('node_modules')
Rails.application.config.assets.paths << Rails.root.join(
  'node_modules/@blueprintjs/icons/lib/css'
)

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
Rails.application.config.assets.precompile += %w[
  print.css
  blueprint-icons-16.eot
  blueprint-icons-16.ttf
  blueprint-icons-16.woff
  blueprint-icons-16.woff2
  blueprint-icons-20.eot
  blueprint-icons-20.ttf
  blueprint-icons-20.woff
  blueprint-icons-20.woff2
]
