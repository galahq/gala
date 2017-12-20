# frozen_string_literal: true

class Case < ApplicationRecord
  include Authority::Abilities
  include Comparable

  include Mobility
  translates :kicker, :title, :dek, :summary, :narrative, :translators,
             :learning_objectives, :audience, :classroom_timeline,
             :acknowledgements, :authors,
             fallbacks: true

  time_for_a_boolean :published
  time_for_a_boolean :featured

  resourcify

  belongs_to :library

  has_many :activities, dependent: :destroy
  has_many :cards
  has_many :case_elements, -> { order position: :asc }, dependent: :destroy
  has_many :comment_threads, dependent: :destroy
  has_many :comments, through: :comment_threads
  has_many :edgenotes, dependent: :destroy
  has_many :enrollments, dependent: :destroy
  has_many :forums, dependent: :destroy
  has_many :pages, dependent: :destroy
  has_many :podcasts, dependent: :destroy
  has_many :readers, through: :enrollments
  has_many :deployments, dependent: :destroy
  has_many :quizzes, dependent: :destroy

  scope :published, -> { where.not(published_on: nil) }
  scope :ordered,
        -> do
          order(<<~SQL)
            featured_at DESC NULLS LAST, published_at DESC NULLS LAST
          SQL
        end

  validates :slug, presence: true, uniqueness: true
  validates_format_of :slug, with: /\A[a-z0-9-]+\Z/

  after_create :create_forum_for_global_community

  def <=>(other)
    return published ? 1 : -1 if published ^ other.try(:published)
    return published_at.nil? ? -1 : 1 if published_at.nil? ||
                                         other.published_at.nil?
    published_at <=> other.published_at
  end

  def create_forum_for_global_community
    Forum.create case: self
  end

  def to_param
    slug
  end

  def events
    Ahoy::Event.for_case self
  end

  def other_available_locales
    read_attribute(:title).keys - [I18n.locale.to_s]
  end

  def translators
    super || []
  end

  def readers_by_enrollment_status
    hash = {}
    Enrollment.statuses.each do |type, _|
      hash[type] = enrollments.select(&:"#{type}?")
    end
    hash
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
