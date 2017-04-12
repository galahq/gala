class Reader < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
         :trackable, :validatable, :confirmable, :omniauthable, omniauth_providers: [:google, :lti]
  before_save :ensure_authentication_token

  include Authority::UserAbilities
  include Authority::Abilities

  rolify

  has_many :comment_threads
  has_many :comments
  has_many :group_memberships, dependent: :delete_all
  has_many :groups, through: :group_memberships
  has_many :enrollments, -> { includes(:case) }, dependent: :delete_all
  has_many :cases, through: :enrollments

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |reader|
      reader.email = auth.info.email
      reader.password = Devise.friendly_token[0,20]
      reader.name = auth.info.name
      reader.initials = auth.info.name.split(" ").map(&:first).join
      reader.image_url = auth.info.image
    end
  end

  def self.new_with_session(params, session)
    super.tap do |reader|
      if data = session["devise.google_data"]
        reader.name = data["info"]["name"]
        reader.initials = data["info"]["name"].split(" ").map(&:first).join
        reader.email = data["info"]["email"]
        reader.image_url = data["info"]["image_url"]
      end
    end
  end

  def ensure_authentication_token
    if authentication_token.blank?
      self.authentication_token = generate_authentication_token
    end
  end

  def enrollment_for_case(c)
    enrollments.find { |e| e.case.id == c.id }
  end


  def name_and_email
    "#{name} <#{email}>"
  end

  private
  def generate_authentication_token
    loop do
      token = Devise.friendly_token
      break token unless Reader.where(authentication_token: token).first
    end
  end
end
