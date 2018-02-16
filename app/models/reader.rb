# frozen_string_literal: true

# The user model. It has devise methods in addition to those listed below.
#
# @attr name [String]
# @attr email [String] the unique login for devise
# @attr password [EncryptedString]
# @attr initials [String]
# @attr locale [Iso639_1Code] the reader’s preferred locale
# @attr created_password [Boolean] readers who sign in first with Omniauth will
#   not initially select a password in order to sign in without that provider.
#   If this attribute is false, the user can create a password without providing
#   the password that was randomly generated for their account in the Omniauth
#   callback process. After it has been set, the previous password will need to
#   be provided.
# @attr send_reply_notifications [Boolean] whether or not the user wants to be
#   notified by email when another reader responds to her comment
# @attr active_community_id [Numeric] the id of the reader’s most recently
#   activated community
#
# @see AnonymousUser AnonymousUser: this model’s null object
class Reader < ApplicationRecord
  default_scope { order(:name) }

  has_many :authentication_strategies, dependent: :destroy

  has_many :enrollments, -> { includes(:case) }, dependent: :destroy
  has_many :cases, through: :enrollments

  has_many :group_memberships, dependent: :destroy
  has_many :groups, through: :group_memberships
  has_many :deployments, through: :groups

  has_many :submissions, dependent: :destroy
  has_many :answers, dependent: :destroy
  has_many :quizzes, through: :answers

  has_many :invitations, dependent: :destroy
  has_many :invited_communities, through: :invitations, source: :community

  has_many :group_communities, through: :groups, source: :community
  has_many :comment_threads, dependent: :nullify
  has_many :comments, dependent: :nullify

  has_many :events, class_name: 'Ahoy::Event', foreign_key: 'user_id'

  has_one_attached :image

  before_update :set_created_password, if: :encrypted_password_changed?

  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
         :trackable, :validatable, :confirmable

  rolify

  # Creates a Reader from the information provided by an OAuth provider
  # @param auth [Auth]
  def self.from_omniauth(auth)
    find_or_create_by!(email: auth.email) do |reader|
      reader.attributes = auth.reader_attributes
      reader.add_role :instructor if auth.instructor?
    end
  end

  # @return [Community, GlobalCommunity]
  def active_community
    return GlobalCommunity.instance if active_community_id.nil?
    Community.find(active_community_id)
  end

  # A reader’s communities include those she has a {GroupMembership} in and an
  # {Invitation} to. This relation does not include the {GlobalCommunity}, but
  # all readers are a member therein.
  # @return [ActiveRecord::Relation<Community>]
  def communities
    query = Community
            .distinct
            .joins(<<~SQL.squish)
              LEFT JOIN "invitations"
              ON "communities"."id" = "invitations"."community_id"
            SQL
            .joins(<<~SQL.squish)
              LEFT JOIN "groups"
              ON "communities"."group_id" = "groups"."id"
                LEFT JOIN "group_memberships"
                ON "groups"."id" = "group_memberships"."group_id"
            SQL

    query.where("invitations.reader_id = #{id}").or(
      query.where("group_memberships.reader_id = #{id}")
    )
  end

  # @deprecated
  def ensure_authentication_token
    return unless authentication_token.blank?
    self.authentication_token = generate_authentication_token
  end

  # @return [Enrollment]
  def enrollment_for_case(c)
    enrollments.find { |e| e.case.id == c.id }
  end

  # A hash of the reader’s email used to calculate her Identicon without leaking
  # her private email to other users clever enough to open the browser inspector
  # @return [String]
  def hash_key
    @hash_key ||= Digest::SHA256.hexdigest(email)
  end

  # Overrides :add_role from 'rolify' in order to add the reader to CaseLog when
  # they are made an instructor
  def add_role(name, *rest)
    role = super name, *rest
    return role unless name.to_sym == :instructor

    invited_communities << Community.case_log
    role
  end

  # Overrides :remove_role from 'rolify' to remove the reader’s invitation to
  # CaseLog when they are made not an instructor
  def remove_role(name, *rest)
    relation = super name, *rest
    return relation unless name.to_sym == :instructor

    invitations.where(community: Community.case_log).each(&:destroy)
    relation
  end

  # Whether or not the given quiz belongs to this author
  def quiz?(quiz)
    (quiz.lti_uid && quiz.lti_uid == lti_uid) ||
      (quiz.author_id && quiz.author_id == id)
  end

  # The reader’s information for a To: header of an email
  # @todo Move to a decorator
  # @return [String]
  def name_and_email
    "#{name} <#{email}>"
  end

  # OAuth providers with which this reader can sign in
  # @return [Array<String>]
  def providers
    authentication_strategies.pluck :provider
  end

  # This user’s unique identifier as given by an LMS
  # @todo This assumes a user will only ever sign in with one LMS... fix that
  # @return [String, nil]
  def lti_uid
    @lti_uid ||= authentication_strategies.where(provider: 'lti').pluck :uid
  end

  private

  def set_created_password
    self.created_password = true
  end
end
