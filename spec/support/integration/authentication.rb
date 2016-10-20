module Orchard
  module Integration
    module TestHelpers
      module Authentication
        def login_as(reader)
          visit root_path
          fill_in 'reader[email]', with: reader.email
          fill_in 'reader[password]', with: 'secret'
          click_button 'Sign in'
        end
      end
    end
  end
end
