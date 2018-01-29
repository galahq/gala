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

  # @param auth
  # @return [AuthenticationStrategy]
  def self.from_omniauth(auth)
    find_or_create_by!(provider: auth.provider, uid: auth.uid) do |strategy|
      strategy.reader = Reader.from_omniauth Auth.new auth
    end
  end
end
