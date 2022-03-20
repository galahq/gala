Capybara.register_driver :remote_selenium do |app|
    
    options = Selenium::WebDriver::Chrome::Options.new
    options.add_argument("--window-size=1400,1400")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
  
    Capybara::Selenium::Driver.new(
      app,
      browser: :chrome,
      url: "http://selenium:4444/wd/hub",
      options: options,
    )
  end
  
  Capybara.register_driver :remote_selenium_headless do |app|
    options = Selenium::WebDriver::Chrome::Options.new
    options.add_argument("--headless")
    options.add_argument("--window-size=1400,1400")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
  
    Capybara::Selenium::Driver.new(
      app,
      browser: :chrome,
      url: "http://selenium:4444/wd/hub",
      options: options,
    )
  end
  
  Capybara.register_driver :local_selenium do |app|
    options = Selenium::WebDriver::Chrome::Options.new
    options.add_argument("--window-size=1400,1400")
  
    Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
  end
  
  Capybara.register_driver :local_selenium_headless do |app|
    options = Selenium::WebDriver::Chrome::Options.new
    options.add_argument("--headless")
    options.add_argument("--window-size=1400,1400")
  
    Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
  end

  selenium_app_host = ENV.fetch("SELENIUM_APP_HOST") do
    Socket.ip_address_list
          .find(&:ipv4_private?)
          .ip_address
  end
  
  Capybara.configure do |config|
    config.server = :puma, { Silent: true }
    config.server_host = selenium_app_host
    config.server_port = 4000
    config.default_driver = :remote_selenium
  end
  
  RSpec.configure do |config|

    config.after(:each) do |example|
        if defined?(page) && example.exception
            puts "Error"
            puts page.driver.browser
            #save_screenshot
            
            #Rails.logger.info page.driver.browser.manage.logs.get('browser')
                                #  .map(&:as_json).awesome_inspect
        end
    end

    config.before(:each, type: [:system, :feature]) do |example|
      # `Capybara.app_host` is reset in the RSpec before_setup callback defined
      # in `ActionDispatch::SystemTesting::TestHelpers::SetupAndTeardown`, which
      # is annoying as hell, but not easy to "fix". Just set it manually every
      # test run.
      Capybara.app_host = "http://#{Capybara.server_host}:#{Capybara.server_port}"
    end
  end