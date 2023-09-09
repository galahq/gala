# frozen_string_literal: true

# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../config/environment', __dir__)
# Prevent database truncation if the environment is production
abort('The Rails environment is running in production mode!') if Rails.env.production?
require 'spec_helper'
require 'rspec/rails'
# Add additional requires below this line. Rails is not loaded until this point!
require 'action_mailbox/test_helper'

require 'devise'

require 'capybara/rails'
require 'capybara/rspec'

require 'clowne/rspec'
require 'rspec/composable_json_matchers/setup'

require "selenium-webdriver"

require 'capybara-screenshot/rspec'

require 'webdrivers'

class Ahoy::Store
  def exclude?
    false
  end
end

OmniAuth.config.test_mode = true
OmniAuth.config.mock_auth[:google] = OmniAuth::AuthHash.new Faker::Omniauth.google

# Requires supporting ruby files with custom matchers and macros, etc, in
# spec/support/ and its subdirectories. Files matching `spec/**/*_spec.rb` are
# run as spec files by default. This means that files in spec/support that end
# in _spec.rb will both be required and run as specs, causing the specs to be
# run twice. It is recommended that you do not name files matching this glob to
# end with _spec.rb. You can configure this pattern with the --pattern
# option on the command line or in ~/.rspec, .rspec or `.rspec-local`.
#
# The following line is provided for convenience purposes. It has the downside
# of increasing the boot-up time by auto-requiring all files in the support
# directory. Alternatively, in the individual `*_spec.rb` files, manually
# require only the support files necessary.
#
Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

# Checks for pending migration and applies them before tests are run.
# If you are not using ActiveRecord, you can remove this line.
ActiveRecord::Migration.maintain_test_schema!

Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end

Capybara.register_driver :selenium do |app|
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument("--headless")
  options.add_argument('--no-sandbox')
  options.add_argument('--disable-dev-shm-usage')
  options.add_argument('--allow-insecure-localhost')
  options.add_argument('--ignore-certificate-errors')
  options.add_argument('--disable-web-security')
  options.add_argument('--disable-gpu')
  options.add_argument('--allow-running-insecure-content')

  Capybara::Selenium::Driver.new(
    app,
    browser: :chrome,
    url: File.file?('/.dockerenv') ? "http://selenium:4444/wd/hub" : nil,
    capabilities: [options]
  )
end

Capybara.default_driver = :selenium

Capybara.configure do |config|
  config.save_path = ENV['CIRCLE_ARTIFACTS'] if ENV['CIRCLE_ARTIFACTS']
end
Capybara.enable_aria_label = true

RSpec.configure do |config|
  config.include ActionMailbox::TestHelper, type: :mailbox
  config.include ActiveSupport::Testing::TimeHelpers
  config.include Devise::Test::ControllerHelpers, type: :controller
  config.include Devise::Test::IntegrationHelpers, type: :request
  config.include FactoryBot::Syntax::Methods
  config.include Orchard::Integration::TestHelpers::Authentication, type: :feature

  Capybara.server_host = Socket.ip_address_list.find(&:ipv4_private?).ip_address
  Capybara.server_port = 4000

  config.before(:each, type: :feature) do |example|
    Capybara.app_host = "http://#{Capybara.server_host}:#{Capybara.server_port}"
    Capybara.use_default_driver
    Capybara.server = :puma, { Silent: true}
    Capybara.javascript_driver = Capybara.default_driver
    Capybara.current_driver = Capybara.default_driver
    Capybara.page.current_window.resize_to(1600, 1200)
  end

  config.before(:each) do |example|
    Rails.application.config.current_terms_of_service = 1
  end

  config.around(:each, type: :mailbox) do |example|
    old_adapter = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    example.run
  ensure
    ActiveJob::Base.queue_adapter = old_adapter
  end

  config.use_transactional_fixtures = true

  # RSpec Rails can automatically mix in different behaviours to your tests
  # based on their file location, for example enabling you to call `get` and
  # `post` in specs under `spec/controllers`.
  #
  # You can disable this behaviour by removing the line below, and instead
  # explicitly tag your specs with their type, e.g.:
  #
  #     RSpec.describe UsersController, :type => :controller do
  #       # ...
  #     end
  #
  # The different available types are documented in the features, such as in
  # https://relishapp.com/rspec/rspec-rails/docs
  config.infer_spec_type_from_file_location!

  # Filter lines from Rails gems in backtraces.
  config.filter_rails_from_backtrace!
  # arbitrary gems may also be filtered via:
  # config.filter_gems_from_backtrace("gem name")
end