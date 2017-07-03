# frozen_string_literal: true

class AuthenticationStrategy < ApplicationRecord
  devise :omniauthable, omniauth_providers: %i[google lti]

  belongs_to :reader

  validates :reader, presence: true

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create! do |strategy|
      strategy.reader = Reader.from_omniauth(auth)
    end
  end
end
