# frozen_string_literal: true

# A user’s oauth information allowing them to sign in with Google or through
# their LMS (e.g. Canvas)
#
# @attr provider ['google' | 'lti']
# @attr uid [String]
class AuthenticationStrategy < ApplicationRecord
  belongs_to :reader

  validates :reader, presence: true

  devise :omniauthable, omniauth_providers: %i[google lti]

  # @return [AuthenticationStrategy]
  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create! do |strategy|
      strategy.reader = Reader.from_omniauth(auth)
    end
  end
end
