# frozen_string_literal: true

source 'https://rubygems.org'

ruby '2.7.6'

gem 'rails', '~> 6.1.7' # Latest Rails 6.1

# Infrastructure
gem 'aws-sdk-s3', require: false
gem 'aws-sdk-sns', '>= 1.9.0', require: false
gem 'bootsnap', '>= 1.9.3', require: false
gem 'connection_pool'
gem 'image_processing', '~> 1.12'
gem 'net-http'
gem 'pg', '>= 1.1', '< 2.0' # PostgreSQL 16 compatibility
gem 'puma', '~> 5.6' # Upgraded Puma for performance and security
gem 'rack-canonical-host'
gem 'redis', '~> 4.5' # Redis 6 compatibility
gem 'sidekiq', '~> 7.0'
gem 'sqlite3', '~> 1.6.0' # Updated for Rails 6.1 compatibility
gem 'wkhtmltopdf-binary' # Installs wkhtmltopdf for PDF generation

# Models
gem 'active_storage_validations'
gem 'acts_as_list', '~> 0.9.10'
gem 'clowne', '0.2.0'
gem 'clowne_active_storage'
gem 'draper'
gem 'friendly_id', '~> 5.2.3'
gem 'kaminari'
gem 'memoist'
gem 'time_for_a_boolean', '~> 0.2.2'
gem 'virtus'

# Authentication and Authorization
gem 'devise', '~> 4.8' # Updated for Rails 6.1 compatibility
gem 'devise-i18n'
gem 'ims-lti'
gem 'omniauth-facebook'
gem 'omniauth-google-oauth2'
gem 'omniauth-lti', git: 'https://github.com/cbothner/omniauth-lti'
gem 'pundit'
gem 'rolify'

# Events
gem 'ahoy_matey'
gem 'groupdate'

# Localization
gem 'http_accept_language'
gem 'i18n_generators'
gem 'i18n_yaml_sorter', group: :development
gem 'mobility'

# View Interpreters
gem 'active_model_serializers', '0.10.12' # Minor update
gem 'haml', '5.1.2'
gem 'inline_svg'
gem 'jbuilder', '~> 2.11' # Updated gem release
gem 'markerb', git: 'https://github.com/cbothner/markerb'
gem 'multi_json'
gem 'oj', '~> 3.13'
gem 'oj_mimic_json'
gem 'pdfkit'
gem 'redcarpet'
gem 'sass-rails', '~> 6.0.0'
gem 'sassc', '~> 2.4.0'

gem 'webpacker', '~> 5.4' # Latest 5.x version for Rails 6

# Logging and Monitoring
gem 'administrate', '~> 0.17.0'
gem 'administrate-field-active_storage'
gem 'awesome_print'
gem 'barnes'
gem 'lograge'
gem 'sentry-raven', '~> 3.1'
gem 'skylight', '~> 5.2' # Updated for Rails 6.1 compatibility
gem 'table_print'

# Services
gem 'email_reply_parser'
gem 'opengraph_parser'
gem 'ruby-oembed'

# To seed the database for Heroku review apps, this is included in production
gem 'factory_bot_rails'
gem 'faker', '~> 2.19'

group :development do
  gem 'foreman'
  gem 'listen', '~> 3.7'
  # Spring speeds up development
  gem 'bullet', '>= 6.1.1'
  gem 'letter_opener'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'web-console', '>= 4.1.0'

  gem 'doc_to_dash'
  gem 'yard'
  gem 'yard-activerecord'
  gem 'yard-activesupport-concern'

  gem 'flamegraph'
  gem 'memory_profiler'
  gem 'rack-mini-profiler'
  gem 'stackprof'
end

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger
  # console
  gem 'pry-byebug', platform: :mri
  gem 'pry-rails'

  gem 'capybara', '~> 3.39'
  gem 'guard-rspec'
  gem 'rspec'
  gem 'rspec-composable_json_matchers'
  gem 'rspec-rails', '~> 5.1' # Updated for Rails 6.1
  gem 'rspec_junit_formatter'
  gem 'selenium-webdriver'
  gem 'spring-commands-rspec'
  gem 'dotenv-rails'
  gem 'rubocop-faker'
end

group :test do
  gem 'capybara-screenshot'
  gem 'database_cleaner-active_record'
  gem 'ffi', '~> 1.15', '>= 1.15.5'
  gem 'rspec-retry'
  gem 'shoulda-matchers', '~> 4.5'
  gem 'webdrivers', require: false
end
