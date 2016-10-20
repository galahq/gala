module Orchard
  module Integration
    module TestHelpers
      module Authentication
        def login_as(user, password="secret")
          params = { user: { email: user.email, password: password  } }
          page.driver.send(:post, user_sessions_path, params)
        end
      end
    end
  end
end
