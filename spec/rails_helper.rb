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

Capybara.register_driver :headless_chrome do |app|
  Capybara::Selenium::Driver.load_selenium
  browser_options = ::Selenium::WebDriver::Chrome::Options.new.tap do |opts|
    opts.args << '--headless'
    opts.args << '--disable-gpu' if Gem.win_platform?
    # Workaround https://bugs.chromium.org/p/chromedriver/issues/detail?id=2650&q=load&sort=-id&colspec=ID%20Status%20Pri%20Owner%20Summary
    opts.args << '--disable-site-isolation-trials'
    opts.args << '--window-size=1440,900'
  end
  Capybara::Selenium::Driver.new(app, browser: :chrome, options: browser_options)
end

# Add support for Headless Chrome screenshots.
Capybara::Screenshot.register_driver(:headless_chrome) do |driver, path|
  driver.browser.save_screenshot(path)
end


Capybara.register_driver :selenium do |app|
  Capybara::Selenium::Driver.load_selenium
  browser_options = ::Selenium::WebDriver::Chrome::Options.new.tap do |opts|
    opts.args << '--headless'
    opts.args << '--disable-gpu'
    opts.args << '--disable-site-isolation-trials'
    opts.args << '--window-size=1440,900'
    opts.args << '--disable-dev-shm-usage'
    opts.args << '--allow-insecure-localhost'
    opts.args << '--ignore-certificate-errors'
    opts.args << '--disable-web-security'
    opts.args << '--allow-running-insecure-content'
  end
  Capybara::Selenium::Driver.new(app, browser: :remote, url: "http://selenium:4444/wd/hub", options: browser_options)
end

Capybara.default_driver = if File.file?('/.dockerenv')
  Webdrivers::Chromedriver.required_version = "113.0.5672.63"
  :selenium
else
  Webdrivers::Chromedriver.required_version = "114.0.5735.90"
  :headless_chrome
end



Capybara.configure do |config|
  config.save_path = ENV['CIRCLE_ARTIFACTS'] if ENV['CIRCLE_ARTIFACTS']
end
Capybara.enable_aria_label = true

app_host = Socket.ip_address_list
            .find(&:ipv4_private?)
            .ip_address

RSpec.configure do |config|
  config.include ActionMailbox::TestHelper, type: :mailbox
  config.include ActiveSupport::Testing::TimeHelpers
  config.include Devise::Test::ControllerHelpers, type: :controller
  config.include Devise::Test::IntegrationHelpers, type: :request
  config.include FactoryBot::Syntax::Methods
  config.include Orchard::Integration::TestHelpers::Authentication, type: :feature

  Capybara.server_host = app_host
  Capybara.server_port = 4000

  config.before(:each, type: :feature) do |example|
    Capybara.app_host = "http://#{Capybara.server_host}:#{Capybara.server_port}"
    Capybara.use_default_driver
    Capybara.server = :puma, { Silent: true}
    Capybara.javascript_driver = Capybara.default_driver
    Capybara.current_driver = Capybara.default_driver
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