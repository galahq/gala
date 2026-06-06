# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# jsbundling-rails and cssbundling-rails write browser-ready assets here.
Rails.application.config.assets.paths << Rails.root.join('app/assets/builds')

# Keep Sass source files out of Propshaft's public load path. Dart Sass writes
# the few public CSS outputs to app/assets/builds during build:css.
Rails.application.config.assets.excluded_paths << Rails.root.join('app/assets/stylesheets')
