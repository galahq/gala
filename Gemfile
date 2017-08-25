# frozen_string_literal: true

source 'https://rubygems.org'

gem 'pg', '~> 0.18'
gem 'puma', '~> 3.0'
gem 'rails', '>= 5.0.0', '< 5.1'

gem 'bourbon'
gem 'coffee-rails', '~> 4.1.0'
gem 'haml'
gem 'inline_svg'
gem 'jbuilder', '~> 2.0'
gem 'jquery-rails'
gem 'markerb'
gem 'redcarpet'
gem 'sass-rails', '~> 5.0'
gem 'uglifier', '>= 1.3.0'
gem 'webpacker', git: 'https://github.com/rails/webpacker'

gem 'dalli'
gem 'redis', '~> 3.0'

gem 'newrelic_rpm'

group :test do
  gem 'database_cleaner'
end

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platform: :mri
  gem 'pry'

  gem 'capybara'
  gem 'factory_girl_rails'
  gem 'faker'
  gem 'guard-rspec'
  gem 'rspec-rails', '~> 3.5'
  gem 'rspec_junit_formatter'
  gem 'selenium-webdriver'
  gem 'spring-commands-rspec'
end

group :development do
  gem 'foreman'
  gem 'listen', '~> 3.1.5'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'awesome_print'
  gem 'bullet'
  gem 'letter_opener'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'web-console'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'table_print'
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]

gem 'acts_as_list'
gem 'virtus'

gem 'authority'
gem 'devise', '~> 4.1'
gem 'devise-i18n'
gem 'ims-lti'
gem 'omniauth-facebook'
gem 'omniauth-google-oauth2'
gem 'omniauth-lti', github: 'cbothner/omniauth-lti'
gem 'rolify'

gem 'ahoy_matey', github: 'ankane/ahoy'
gem 'groupdate'

gem 'http_accept_language'
gem 'i18n_generators'
gem 'mobility'

gem 'rack-canonical-host'

ruby '2.3.1'
