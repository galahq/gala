class Reader < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
         :trackable, :validatable, :omniauthable, omniauth_providers: [:facebook, :google_oauth2]

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |reader|
      reader.email = auth.info.email
      reader.password = Devise.friendly_token[0,20]
      reader.name = auth.info.name
      reader.image = auth.info.image
    end
  end
end
