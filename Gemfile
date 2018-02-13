# frozen_string_literal: true

source 'https://rubygems.org'

gem 'rails', '>= 5.2.0-rc1', '< 5.3'

# Infrastructure
gem 'aws-sdk-s3', require: false
gem 'bootsnap', require: false
gem 'connection_pool'
gem 'dalli'
gem 'mini_magick'
gem 'pg', '~> 0.18'
gem 'puma', '~> 3.0'
gem 'rack-canonical-host'
gem 'redis', '~> 3.0'

# Models
gem 'acts_as_list', git: 'https://github.com/swanandp/acts_as_list.git', ref: '2811810'
gem 'draper'
gem 'kaminari'
gem 'memoist'
gem 'time_for_a_boolean', git: 'https://github.com/calebthompson/time_for_a_boolean'
gem 'virtus'

# Authentication and Authorization
gem 'authority'
gem 'devise', '~> 4.1'
gem 'devise-i18n'
gem 'ims-lti'
gem 'omniauth-facebook'
gem 'omniauth-google-oauth2'
gem 'omniauth-lti', git: 'https://github.com/cbothner/omniauth-lti'
gem 'pundit'
gem 'rolify'

# Events
gem 'ahoy_matey', git: 'https://github.com/ankane/ahoy'
gem 'groupdate'

# Localization
gem 'http_accept_language'
gem 'i18n_generators'
gem 'mobility'

# View Interpreters
gem 'haml'
gem 'inline_svg'
gem 'jbuilder', '~> 2.0'
gem 'markerb'
gem 'multi_json'
gem 'oj'
gem 'oj_mimic_json'
gem 'redcarpet'
gem 'sass-rails', '~> 5.0'
gem 'uglifier', '>= 1.3.0'
gem 'webpacker', git: 'https://github.com/rails/webpacker'

# Front-end
gem 'bourbon'
gem 'coffee-rails'
gem 'jquery-rails'

# Logging and Monitoring
gem 'awesome_print'
gem 'lograge'
gem 'newrelic_rpm'
gem 'scout_apm'
gem 'table_print'

group :development do
  gem 'foreman'
  gem 'listen'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'bullet'
  gem 'letter_opener'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'web-console'

  gem 'doc_to_dash', git: 'https://github.com/pchaganti/doc_to_dash'
  gem 'yard'
  gem 'yard-activerecord'
  gem 'yard-activesupport-concern'
end

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platform: :mri
  gem 'pry'

  gem 'capybara'
  gem 'guard-rspec'
  gem 'rspec'
  gem 'rspec-rails'
  gem 'rspec_junit_formatter'
  gem 'selenium-webdriver'
  gem 'spring-commands-rspec'
end

# To seed the database for Heroku review apps, this is included in production
gem 'factory_bot_rails'
gem 'faker'

group :test do
  gem 'database_cleaner'
end

ruby '2.5.0'
