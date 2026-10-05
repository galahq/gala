# frozen_string_literal: true

# The user model. It has devise methods in addition to those listed below.
#
# @attr name [String]
# @attr email [String] the unique login for devise
# @attr password [EncryptedString]
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
  include Onboarding

  default_scope { order(:name) }

  enum :persona, {
    learner: 'learner',
    teacher: 'teacher',
    writer: 'writer'
  }

  has_many :authentication_strategies, dependent: :destroy

  has_many :enrollments, -> { includes(:case) }, dependent: :destroy
  has_many :enrolled_cases, through: :enrollments, source: :case

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

  # Analytics. Whether a departing reader's activity records may be deleted
  # is the open FERPA retention question (E1 in the compliance register), so
  # `:nullify` is the interim: the rows stay, only the link is cleared. Neither
  # table has a database foreign key, which is how 17 visits and 36 events
  # were left pointing at readers destroyed in August 2026 — `events` was
  # declared but had no `dependent:`, and `visits` was not declared at all.
  # Nothing reads the link once the reader is gone: enrollments and roles,
  # which `Enrollment#case_completion` and `Ahoy::Event.interesting` depend
  # on, are destroyed with the reader.
  has_many :events, class_name: 'Ahoy::Event', foreign_key: 'user_id',
                    inverse_of: :user, dependent: :nullify
  has_many :visits, class_name: 'Visit', foreign_key: 'user_id',
                    inverse_of: :user, dependent: :nullify

  # Records whose `belongs_to :reader` is required, so they cannot outlive the
  # reader. Both of these also carry a database foreign key, and their absence
  # here is what made `reader.destroy` raise InvalidForeignKey rather than
  # fail gracefully.
  has_many :locks, dependent: :destroy
  has_many :case_library_requests, dependent: :destroy,
                                   foreign_key: 'requester_id',
                                   inverse_of: :requester

  # A reply notification requires both of its readers, so it cannot survive
  # either of them being removed.
  has_many :reply_notifications, dependent: :destroy
  has_many :sent_reply_notifications, class_name: 'ReplyNotification',
                                      dependent: :destroy,
                                      foreign_key: 'notifier_id',
                                      inverse_of: :notifier

  # Optional back-references: these survive their reader, unlinked.
  has_many :sent_invitations, class_name: 'Invitation', dependent: :nullify,
                              foreign_key: 'inviter_id',
                              inverse_of: :inviter
  has_many :authored_quizzes, class_name: 'Quiz', dependent: :nullify,
                              foreign_key: 'author_id', inverse_of: :author

  has_many :editorships, dependent: :destroy, foreign_key: 'editor_id'
  has_many :my_cases, through: :editorships, source: :case

  has_many :managerships, dependent: :destroy, foreign_key: 'manager_id'
  has_many :libraries, through: :managerships
  has_many :managed_cases, through: :libraries, source: :cases

  has_many :reading_lists, dependent: :destroy
  has_many :reading_list_saves, dependent: :destroy
  has_many :saved_reading_lists,
           -> { includes(reading_list_items: :case) },
           through: :reading_list_saves, source: :reading_list

  has_one_attached :image

  # Account closure, Tier 1 (compliance register A22). `closed_at` is the cheap
  # flag presentation reads; the request row is the audit trail and the
  # sweep's queue. See Readers::CloseAccount, RestoreAccount, AnonymizeAccount.
  has_many :account_deletion_requests, dependent: :destroy,
                                       inverse_of: :reader
  has_one :pending_account_deletion_request, -> { pending },
          class_name: 'AccountDeletionRequest', inverse_of: :reader
  scope :active, -> { where(closed_at: nil) }

  before_update :set_created_password, if: :encrypted_password_changed?
  after_save :invite_to_caselog, if: -> { persona.in? %w[writer teacher] }

  validates :image, size: { less_than: 2.megabytes,
                            message: 'cannot be larger than 2 MB' },
                    content_type: { in: %w[image/png image/jpeg],
                                    message: 'must be JPEG or PNG' }

  devise :database_authenticatable, :registerable, :recoverable, :rememberable,
         :trackable, :validatable, :confirmable

  rolify

  # Creates a Reader from the information provided by an OAuth provider
  # @param auth [Auth]
  def self.from_omniauth(auth)
    find_or_create_by!(email: auth.email) do |reader|
      reader.attributes = auth.reader_attributes
      reader.invite_to_caselog if auth.instructor?
    end
  end

  # What everyone else sees a closed account called, from the moment it is
  # closed and forever after it is anonymized.
  def self.deleted_name
    I18n.t('readers.deleted_name', default: 'Deleted user')
  end

  # Closed means the reader asked to leave and is inside the 30-day grace
  # window, or has since been anonymized. The row keeps its real name during
  # the window so {Readers::RestoreAccount} can undo it; `read_attribute(:name)`
  # still returns it for the admin screens.
  def closed?
    closed_at.present?
  end

  def anonymized?
    anonymized_at.present?
  end

  def name
    closed? ? self.class.deleted_name : super
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
    # Only scan in Ruby when the records are already in memory (association
    # loaded, or an unsaved reader with built enrollments) — otherwise this
    # loaded every enrollment (and its case) to find one row.
    if new_record? || enrollments.loaded?
      enrollments.find { |e| e.case_id == c.id }
    else
      enrollments.find_by(case_id: c.id)
    end
  end

  # @return [CaseLibraryRequest] the request for case +c+ in a library this
  #   reader manages, or nil. (Previously queried from +managerships+ and so
  #   returned a Managership — which broke callers expecting +#status+.)
  def request_for_case(c)
    CaseLibraryRequest.where(library_id: library_ids, case: c).first
  end

  # A hash of the reader’s email used to calculate her Identicon without leaking
  # her private email to other users clever enough to open the browser inspector
  # @return [String]
  def hash_key
    @hash_key ||= Digest::SHA256.hexdigest(email)
  end

  # The hash key is memoized from the email, which anonymization replaces.
  def reload(*)
    @hash_key = nil
    super
  end

  def invite_to_caselog
    return if invited_communities.include? Community.case_log

    invited_communities << Community.case_log
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

  # Overridden from Devise for I18n
  def send_devise_notification(notification, *args)
    locale = if I18n.available_locales.include?(self.locale.to_sym)
               self.locale
             else
               I18n.default_locale
             end
    I18n.with_locale(locale) { super notification, *args }
  end

  private

  def set_created_password
    self.created_password = true
  end
end
