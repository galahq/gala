# frozen_string_literal: true

source 'https://rubygems.org'

ruby file: '.ruby-version' # 4.0.3

gem 'rails', '~> 8.1'

# Ruby stdlib gems that are no longer available by default in Ruby 4.

# Infrastructure
gem 'aws-sdk-s3'
gem 'image_processing'
gem 'pg', '~> 1.6'
gem 'puma', '~> 7.1'
gem 'rack-attack'
gem 'anycable-rails-core', '~> 1.5'
gem 'redis', '~> 5.0'
gem 'sidekiq', '~> 7.0'
gem 'thruster', '~> 0.1.21', require: false

# Models
gem 'acts_as_list'
gem 'clowne'
gem 'draper'
gem 'friendly_id'
gem 'kaminari'

# Authentication and Authorization
gem 'devise', '~> 4.8'
gem 'devise-i18n'
gem 'ims-lti'
gem 'omniauth-google-oauth2', '0.8.0'
gem 'omniauth-lti', git: 'https://github.com/cbothner/omniauth-lti'
gem 'pundit'
gem 'rolify'

# Events
gem 'ahoy_matey'
gem 'groupdate'

# Localization
gem 'http_accept_language'
gem 'mobility' # translated columns need to default to {} now

# View Interpreters
gem 'pdfkit', '>= 0.8.7.2'
gem 'redcarpet'

# `galahq/case_grid` is not working and needs an update to fix this error:
# NoMethodError (undefined method `matte=' for {dimension} DirectClass...
# disabling the gem for now
# gem 'case_grid', git: 'https://github.com/galahq/case_grid'

gem 'propshaft'
gem 'cssbundling-rails'
gem 'jsbundling-rails'

# Logging and Monitoring
gem 'administrate', '~> 1.0'
gem 'administrate-field-active_storage', '~> 1.0'
gem 'posthog-rails'
gem 'posthog-ruby'

# Services
gem 'email_reply_parser'
gem 'opengraph_parser'
gem 'ruby-oembed'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger
  # console

  gem 'factory_bot_rails'
  gem 'faker'
  gem 'rspec-composable_json_matchers'
  gem 'rspec-rails'
  gem 'rubocop'
end

group :test do
  gem 'shoulda-matchers', '~> 4.5'
end
