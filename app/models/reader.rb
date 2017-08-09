# frozen_string_literal: true

# Mock public API in AnonymousReader
class Reader < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
         :trackable, :validatable, :confirmable

  include Authority::UserAbilities
  include Authority::Abilities

  rolify

  has_many :authentication_strategies, dependent: :destroy

  has_many :cases, through: :enrollments
  has_many :enrollments, -> { includes(:case) }, dependent: :destroy

  has_many :deployments, through: :groups
  has_many :groups, through: :group_memberships
  has_many :group_memberships, dependent: :destroy

  has_many :quizzes, through: :answers
  has_many :answers, dependent: :destroy

  has_many :invited_communities, -> { includes(:forum) },
           through: :invitations, source: :community
  has_many :invitations, dependent: :destroy

  has_many :group_communities, -> { includes(:forum) },
           through: :groups, source: :community
  has_many :comment_threads, dependent: :nullify
  has_many :comments, dependent: :nullify

  has_many :events, class_name: 'Ahoy::Event', foreign_key: 'user_id'

  before_update :set_created_password, if: :encrypted_password_changed?

  def self.from_omniauth(auth)
    info = auth.info
    email = info.email

    where(email: email).first_or_create! do |reader|
      name = info.first_name != '' && "#{info.first_name} #{info.last_name}"
      name ||= info.name

      reader.email = email
      reader.password = Devise.friendly_token[0, 20]
      reader.created_password = false
      reader.name = name
      reader.initials = name.split(' ').map(&:first).join
      reader.image_url = info.image unless auth.provider == 'lti'
      reader.locale = auth.extra.raw_info.try :[], :launch_presentation_locale

      reader.confirmed_at = Time.zone.now
    end
  end

  def self.new_with_session(params, session)
    super.tap do |reader|
      data = session['devise.google_data']
      if data
        info = data['info']
        reader.name = info['name']
        reader.initials = reader.name.split(' ').map(&:first).join
        reader.email = info['email']
        reader.image_url = info['image_url']
      end
    end
  end

  def communities
    invited_communities | group_communities | [GlobalCommunity.instance]
  end

  def ensure_authentication_token
    return unless authentication_token.blank?
    self.authentication_token = generate_authentication_token
  end

  def enrollment_for_case(c)
    enrollments.find { |e| e.case.id == c.id }
  end

  def quiz?(quiz)
    (quiz.lti_uid && quiz.lti_uid == lti_uid) ||
      (quiz.author_id && quiz.author_id == id)
  end

  def name_and_email
    "#{name} <#{email}>"
  end

  def providers
    authentication_strategies.pluck :provider
  end

  def lti_uid
    @lti_uid ||= authentication_strategies.where(provider: 'lti').pluck :uid
  end

  private

  def set_created_password
    self.created_password = true
  end
end
