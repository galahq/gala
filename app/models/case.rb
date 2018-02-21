# frozen_string_literal: true

# A case study in Gala with attributes for the case’s “metadata” (the catalog or
# overview information) and associations for all the case’s constituent parts.
#
# @attr slug [String] the URL param (managed by friendly_id)
# @attr kicker [Translated<String>] a two or three word tagline for the case.
#   This comes from newspapers: the little mini-headline appearing above the hed
#   to which continuations of the article refer (e.g. “from CORRUPTION, A1”)
# @attr title [Translated<String>] the case’s title, in the form of a question
# @attr dek [Translated<String>] a one-sentence teaser which appears in larger
#   text above the summary
# @attr authors [Translated<{name: String, institution?: String}>]
# @attr translators [Translated<Array<String>>] the translators’ names, if any
# @attr acknowledgements [Translated<String>] a place for the authors’ gratitude
#
# @attr photo_credit [String] attribution for the {cover_url}’s rights holder
# @attr latitude [Numeric] where the case takes place
# @attr longitude [Numeric] where the case takes place
# @attr zoom [Numeric] the default zoom level for the site location map (mapbox)
#
# @attr summary [Translated<String>] a short paragraph-length abstract
# @attr learning_objectives [Translated<Array<String>>]
# @attr audience [Translated<String>] yet unused
# @attr classroom_timeline [Translated<String>] yet unused
#
# @attr published_at [DateTime] generic readers can only access published cases
# @attr featured_at [DateTime] featured cases appear prominently in the catalog
# @attr commentable [Boolean] whether or not forums are enabled on the case
class Case < ApplicationRecord
  include Comparable
  include Mobility
  extend FriendlyId

  attribute :slug, :string, default: -> { SecureRandom.uuid }
  friendly_id :slug, use: %i[history]

  translates :kicker, :title, :dek, :summary, :narrative, :learning_objectives,
             :audience, :classroom_timeline, :acknowledgements, fallbacks: true
  translates :authors, :translators, default: [], fallbacks: true

  belongs_to :library, optional: true

  has_many :cards
  has_many :case_elements, -> { order position: :asc }, dependent: :destroy
  has_many :comment_threads, dependent: :destroy
  has_many :comments, through: :comment_threads
  has_many :edgenotes, dependent: :destroy
  has_many :editorships, dependent: :destroy
  has_many :editors, through: :editorships, class_name: 'Reader'
  has_many :enrollments, dependent: :destroy
  has_many :forums, dependent: :destroy
  has_many :readers, through: :enrollments
  has_many :deployments, dependent: :destroy
  has_many :quizzes, dependent: :destroy

  has_many :activities,
           through: :case_elements, source: :element, source_type: 'Activity'
  has_many :pages,
           through: :case_elements, source: :element, source_type: 'Page'
  has_many :podcasts,
           through: :case_elements, source: :element, source_type: 'Podcast'

  has_one_attached :cover_image

  after_create :create_forum_for_universal_communities

  validates :kicker, :title, :slug, presence: true
  validates :slug, uniqueness: true,
                   format: { with: /\A[a-z0-9-]+\Z/ }

  time_for_a_boolean :featured
  time_for_a_boolean :published

  resourcify

  scope :published, -> { where.not(published_at: nil) }
  scope :ordered,
        -> do
          order(Arel.sql(<<~SQL.squish))
            featured_at DESC NULLS LAST, published_at DESC NULLS LAST
          SQL
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

  # The title is used as a synecdoche for the whole case: if it’s been
  # translated then the case is considered to be available in that language.
  # @note The React front-end currently updates all attributes of a case if one
  #   attribute is edited
  # @return [Array<Iso639_1Code>]
  def other_available_locales
    read_attribute(:title).keys - [I18n.locale.to_s]
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
end
