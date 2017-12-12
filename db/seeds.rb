# frozen_string_literal: true

I18n.locale = :en

if DEV_MOCK_AUTH_HASH
  auth = AuthenticationStrategy.from_omniauth DEV_MOCK_AUTH_HASH
  reader = auth.reader

  reader.add_role :editor
  reader.add_role :invisible
end

10.times { FactoryBot.create :case_with_elements, :published }
