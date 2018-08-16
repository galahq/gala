# frozen_string_literal: true

# A case study in Gala with attributes for the case’s “metadata” (the catalog or
# overview information) and associations for all the case’s constituent parts.
#
# @attr slug [String] the URL param (managed by friendly_id)
# @attr locale [Iso639_1Code] the language the case is written in
#
# @attr kicker [String] a two or three word tagline for the case.
#   This comes from newspapers: the little mini-headline appearing above the hed
#   to which continuations of the article refer (e.g. “from CORRUPTION, A1”)
# @attr title [String] the case’s title, in the form of a question
# @attr dek [String] a one-sentence teaser which appears in larger
#   text above the summary
# @attr authors [{name: String, institution?: String}]
# @attr translators [Array<String>] the translators’ names, if any
# @attr acknowledgements [String] a place for the authors’ gratitude
#
# @attr photo_credit [String] attribution for the {cover_url}’s rights holder
# @attr latitude [Numeric] where the case takes place
# @attr longitude [Numeric] where the case takes place
# @attr zoom [Numeric] the default zoom level for the site location map (mapbox)
#
# @attr summary [String] a short paragraph-length abstract
# @attr learning_objectives [Array<String>]
# @attr audience [String] yet unused
# @attr classroom_timeline [String] yet unused
#
# @attr published_at [DateTime] generic readers can only access published cases
# @attr featured_at [DateTime] featured cases appear prominently in the catalog
# @attr commentable [Boolean] whether or not forums are enabled on the case
class Case < ApplicationRecord
  include Cases::Taggable
  include Lockable
  include Comparable
  extend FriendlyId

  attribute :authors, :json, default: []
  attribute :commentable, default: true
  attribute :locale, :string, default: -> { I18n.locale }
  attribute :slug, :string, default: -> { SecureRandom.uuid }
  attribute :translators, :json, default: []
  friendly_id :slug, use: %i[history]

  belongs_to :library, optional: true
  belongs_to :translation_base,
             class_name: 'Case',
             optional: true # Not really -- just can't = id before saving

  has_many :active_locks, class_name: 'Lock'
  has_many :cards
  has_many :case_elements, -> { order position: :asc }, dependent: :destroy
  has_many :comment_threads, dependent: :destroy
  has_many :comments, through: :comment_threads
  has_many :deployments, dependent: :destroy
  has_many :edgenotes, dependent: :destroy
  has_many :editorships, dependent: :destroy
  has_many :editors, through: :editorships, class_name: 'Reader'
  has_many :enrollments, dependent: :destroy
  has_many :forums, dependent: :destroy
  has_many :quizzes, dependent: :destroy
  has_many :readers, through: :enrollments

  has_many :activities,
           through: :case_elements, source: :element, source_type: 'Activity'
  has_many :pages,
           through: :case_elements, source: :element, source_type: 'Page'
  has_many :podcasts,
           through: :case_elements, source: :element, source_type: 'Podcast'

  has_one_attached :cover_image

  after_create :create_forum_for_universal_communities
  after_save -> {
    update_columns translation_base_id: id if translation_base_id.blank?
  }

  validates :slug, presence: true, uniqueness: true,
                   format: { with: /\A[a-z0-9-]+\Z/ },
                   length: { maximum: 100 }

  time_for_a_boolean :featured
  time_for_a_boolean :published

  resourcify

  scope :published, -> { where.not(published_at: nil) }
  scope :ordered,
        -> do
          order(Arel.sql(<<~SQL.squish))
            cases.featured_at DESC NULLS LAST,
            cases.published_at DESC NULLS LAST,
            cases.updated_at DESC
          SQL
        end

  def self.with_locale_or_fallback(locale)
    locale = ::ActiveRecord::Base.connection.quote locale
    scope = select('DISTINCT ON (cases.translation_base_id) cases.id') \
            .reorder(Arel.sql(<<~SQL.squish))
              cases.translation_base_id,
              CASE WHEN (locale = #{locale}) THEN 0
                   WHEN (locale = 'en')      THEN 1
                   ELSE                           2
              END
    SQL
    where(id: scope)
  end

  # Universal communities and the global community (`community_id == nil`) need
  # to have a forum on all cases.
  def create_forum_for_universal_communities
    Forum.create case: self

    Community.universal.find_each do |community|
      community.forums.create case: self
    end
  end

  # @return [String]
  def to_param
    slug
  end

  # @return [ActiveRecord::Relation<Ahoy::Event>]
  def events
    Ahoy::Event.for_case self
  end

  # The cases that represent translations of this case
  def translations
    translation_set.where.not(id: id)
  end

  def translation_set
    Case.where(translation_base_id: translation_base_id)
  end

  def comment_threads
    CommentThread.where(card: cards)
  end

  def comments
    Comment.where(comment_thread: comment_threads)
  end

  def library
    return SharedCasesLibrary.instance if library_id.nil?
    super
  end

  # This is to conform with Lockable
  def case
    self
  end
end
