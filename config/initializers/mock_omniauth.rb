# frozen_string_literal: true

if Rails.env.development? || ENV['MOCK_OMNIAUTH']
  OmniAuth.config.test_mode = true
  auth_hash = { provider: 'google_oauth2', uid: '1234567890',
                info: {
                  name: 'Developer Admin',
                  email: 'dev@learnmsc.org',
                  first_name: 'Developer',
                  last_name: 'Admin'
                },
                extra: {
                  raw_info: {
                    sub: '123456789',
                    email: 'dev@learnmsc.org',
                    email_verified: true,
                    name: 'Developer Admin',
                    given_name: 'Developer',
                    family_name: 'Admin',
                    locale: 'en'
                  }
                } }
  DEV_MOCK_AUTH_HASH = OmniAuth::AuthHash.new auth_hash
  OmniAuth.config.mock_auth[:google] = DEV_MOCK_AUTH_HASH
end
