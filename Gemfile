# frozen_string_literal: true

source 'https://rubygems.org'

ruby file: '.ruby-version' # 3.2.6

gem 'rails', '~> 7.0'

# Infrastructure
gem 'aws-sdk-s3'
gem 'bootsnap'
gem 'connection_pool'
gem 'image_processing'
gem 'pg'
gem 'puma'
gem 'rack-canonical-host'
gem 'redis', '~> 4.5'
gem 'sidekiq', '~> 7.0'

# Models
gem 'active_storage_validations'
gem 'acts_as_list'
gem 'clowne'
gem 'draper'
gem 'friendly_id'
gem 'kaminari'
gem 'memoist'
gem 'time_for_a_boolean'
gem 'virtus'

# Authentication and Authorization
gem 'devise', '~> 4.8'
gem 'devise-i18n'
gem 'ims-lti'
gem 'omniauth-facebook'
gem 'omniauth-google-oauth2', '0.8.0'
gem 'omniauth-oauth2', '1.6.0'
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
gem 'mobility' # translated columns need to default to {} now

# View Interpreters
gem 'active_model_serializers', '0.10.13'
gem 'haml', '5.1.2'
gem 'inline_svg'
gem 'jbuilder', '~> 2.11'
gem 'markerb', git: 'https://github.com/cbothner/markerb'
gem 'multi_json'
gem 'oj', '~> 3.13'
gem 'oj_mimic_json'
gem 'pdfkit', '>= 0.8.7.2'
gem 'redcarpet'
gem 'rexml'

# wikidata integration
gem 'sparql-client'

# `galahq/case_grid` is not working and needs an update to fix this error:
# NoMethodError (undefined method `matte=' for {dimension} DirectClass...
# disabling the gem for now
# gem 'case_grid', git: 'https://github.com/galahq/case_grid'

gem 'sassc-rails', '~> 2.1', '>= 2.1.2'
gem 'sprockets-rails', '~> 3.5', '>= 3.5.2'
gem 'webpacker', '~> 5.4'

# Logging and Monitoring
gem 'administrate', '0.17.0'
gem 'administrate-field-active_storage'
gem 'awesome_print'
gem 'lograge'
gem 'sentry-raven', '~> 3.1' # sentry-ruby
gem 'skylight', '~> 5.2'
gem 'table_print'

# Services
gem 'email_reply_parser'
gem 'opengraph_parser'
gem 'ruby-oembed'

# To seed the database for Heroku review apps, this is included in production
gem 'factory_bot_rails'
gem 'faker'

group :development do
  gem 'foreman'
  gem 'listen', '~> 3.7'
  # Spring speeds up development
  gem 'bullet', '>= 6.1.1'
  gem 'letter_opener'
  gem 'spring'
  gem 'spring-watcher-listen'
  gem 'web-console', '>= 4.1.0'

  gem 'doc_to_dash'
  gem 'yard'
  gem 'yard-activerecord'
  gem 'yard-activesupport-concern'

  gem 'flamegraph'
  gem 'memory_profiler'
  gem 'rack-mini-profiler'
  gem 'sqlite3', '~> 1.6.0'
  gem 'stackprof'
end

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger
  # console
  gem 'pry-byebug', platform: :mri
  gem 'pry-rails'
  gem 'pry', '~> 0.14.1'

  gem 'capybara'
  gem 'dotenv-rails'
  gem 'guard-rspec'
  gem 'rspec'
  gem 'rspec-composable_json_matchers'
  gem 'rspec_junit_formatter'
  gem 'rspec-rails'
  gem 'rubocop'
  gem 'rubocop-faker'
  gem 'selenium-webdriver'
  gem 'spring-commands-rspec'
end

group :test do
  gem 'capybara-screenshot'
  gem 'database_cleaner-active_record'
  gem 'ffi', '~> 1.15', '>= 1.15.5'
  gem 'rspec-retry'
  gem 'shoulda-matchers', '~> 4.5'
  gem 'webdrivers', require: false
end
