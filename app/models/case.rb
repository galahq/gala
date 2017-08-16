# frozen_string_literal: true

class Case < ApplicationRecord
  include Authority::Abilities
  include Comparable

  include Mobility
  translates :kicker, :title, :dek, :summary, :narrative, :translators,
             :learning_objectives, :audience, :classroom_timeline,
             fallbacks: true
  enum catalog_position: %i[in_index featured]

  resourcify

  has_many :activities, dependent: :destroy
  has_many :cards
  has_many :case_elements, -> { order position: :asc }, dependent: :destroy
  has_many :comment_threads, dependent: :destroy
  has_many :comments, through: :comment_threads
  has_many :edgenotes, dependent: :destroy
  has_many :enrollments, dependent: :destroy
  has_many :pages, dependent: :destroy
  has_many :podcasts, dependent: :destroy
  has_many :readers, through: :enrollments
  has_many :deployments, dependent: :destroy
  has_many :quizzes, dependent: :destroy

  scope :published, -> { where(published: true) }

  validates :slug, presence: true, uniqueness: true
  validates_format_of :slug, with: /\A[a-z0-9-]+\Z/
  validates :publication_date, presence: true, if: :published?

  def <=>(other)
    return published ? 1 : -1 if published ^ other.try(:published)
    return publication_date.nil? ? -1 : 1 if publication_date.nil? ||
                                             other.publication_date.nil?
    publication_date <=> other.publication_date
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
    cards.flat_map(&:comment_threads).uniq
  end

  def comments
    comment_threads.flat_map(&:comments)
  end
end
