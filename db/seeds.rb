# frozen_string_literal: true

I18n.locale = :en

auth = AuthenticationStrategy.from_omniauth DEV_MOCK_AUTH_HASH
reader = auth.reader

reader.add_role :editor
reader.add_role :invisible

10.times { FactoryGirl.create :case_with_elements, :published }
