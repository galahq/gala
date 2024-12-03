# frozen_string_literal: true

source 'https://rubygems.org'

ruby file: '.ruby-version'

gem 'rails', '6.0.2.2'

# Infrastructure
gem 'aws-sdk-s3', require: false
gem 'aws-sdk-sns', '>= 1.9.0', require: false
gem 'bootsnap', '~> 1.7.5', require: false
gem 'connection_pool'
gem 'dalli'
gem 'image_processing'
#gem 'mini_magick'
gem 'pg', '~> 1.2.3'
gem 'puma', '~> 4'
gem 'rack-canonical-host'
gem 'redis', '4.5.0'
gem 'sidekiq', '~> 6.0.0'
gem 'nio4r', '~> 2.5.8'
gem 'msgpack', '~> 1.4.2'
gem 'sqlite3', '~> 1.3'
gem 'sparql-client'

# Models
gem 'active_storage_validations'
gem 'acts_as_list', git: 'https://github.com/swanandp/acts_as_list.git',
                    ref: '2811810'
gem 'clowne', '0.2.0'
gem 'clowne_active_storage'
gem 'draper'
gem 'friendly_id', git: 'https://github.com/norman/friendly_id.git',
                   ref: 'a29e7d'
gem 'kaminari'
gem 'memoist'
gem 'time_for_a_boolean', git: 'https://github.com/calebthompson/time_for_a_boolean'
gem 'virtus'

# Authentication and Authorization
gem 'devise', '~> 4.1'
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
gem 'mobility', '0.8.13'

# View Interpreters
gem 'active_model_serializers', '0.10.10'
gem 'haml', '5.1.2'
gem 'inline_svg'
gem 'jbuilder', git: 'https://github.com/rails/jbuilder', branch: :main
gem 'markerb', git: 'https://github.com/cbothner/markerb'
gem 'multi_json'
gem 'oj'
gem 'oj_mimic_json'
gem 'pdfkit'
gem 'redcarpet'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 6.0.0'
gem 'sassc', '~> 2.4.0'

gem 'webpacker', '~> 5.3.0'

# Logging and Monitoring
gem 'administrate'
gem 'administrate-field-active_storage'
gem 'awesome_print'
gem 'barnes'
gem 'lograge'
gem 'sentry-raven'
gem 'skylight', '>= 4.0.x'
gem 'table_print'
#
# # Services
#gem 'case_grid', git: 'https://github.com/cbothner/case_grid'
gem 'email_reply_parser'
gem 'opengraph_parser'
gem 'ruby-oembed'

group :development do
  gem 'foreman'
  gem 'listen'
  # Spring speeds up development by keeping your application running in the
  # background. Read more: https://github.com/rails/spring
  # gem 'bullet', git: 'https://github.com/flyerhzm/bullet'
  gem 'letter_opener'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'web-console'

  gem 'doc_to_dash' #, git: 'https://github.com/pchaganti/doc_to_dash'
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

  gem 'capybara'
  gem 'guard-rspec'
  gem 'rspec'
  gem 'rspec-composable_json_matchers'
  gem 'rspec-rails'
  gem 'rspec_junit_formatter'
  gem 'selenium-webdriver'
  gem 'spring-commands-rspec'
  gem 'dotenv-rails'
  gem 'rubocop-faker'
end

# To seed the database for Heroku review apps, this is included in production
gem 'factory_bot_rails'
gem 'faker'

group :test do
  gem 'capybara-screenshot'
  gem 'database_cleaner'
  gem 'ffi', '~> 1.15', '>= 1.15.5'
  gem 'rspec-retry'
  gem 'shoulda-matchers'
  gem 'webdrivers', require: false
end

# gem to install wkhtmltopdf for pdfkit
gem 'wkhtmltopdf-binary'
