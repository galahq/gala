# frozen_string_literal: true

module Orchard
  module Integration
    module TestHelpers
      module Authentication
        def login
          login_as FactoryBot.create :reader
        end

        def login_as(reader)
          visit new_reader_session_path
          fill_in 'reader[email]', with: reader.email
          fill_in 'reader[password]', with: 'secret'
          click_button 'Sign in'
        end

        def logout(locale: :en)
          visit new_reader_session_path

          options = I18n.t('readers.form.account_options', locale: locale)
          find("[aria-label='#{options}']").click

          click_on I18n.t('devise.sessions.destroy.sign_out',
                          locale: locale)
        end
      end
    end
  end
end
