class Case < ApplicationRecord
  include Authority::Abilities
  include Comparable

  translates :kicker, :title, :dek, :summary, :narrative, :translators
  enum catalog_position: %i(in_index featured)

  resourcify

  has_many :edgenotes, dependent: :destroy
  has_many :podcasts, -> { order position: :asc }, dependent: :destroy
  has_many :activities, -> { order position: :asc }, dependent: :destroy
  has_many :comment_threads, dependent: :destroy
  has_many :comments, through: :comment_threads
  has_many :enrollments, dependent: :destroy
  has_many :readers, through: :enrollments
  has_many :pages, -> { order position: :asc }, dependent: :destroy
  has_many :cards, through: :pages

  scope :published, -> { where(published: true)  }

  validates :slug, presence: true, uniqueness: true
  validates_format_of :slug, with: /\A[a-z0-9-]+\Z/
  validates :publication_date, presence: true, if: :published?

  def <=>(anOther)
    if published ^ anOther.try(:published)
      return published ? 1 : -1
    elsif publication_date == nil || anOther.publication_date == nil
      return publication_date.nil? ? -1 : 1
    end
    publication_date <=> anOther.publication_date
  end

  def to_param
    slug
  end

  def case_authors
    authors.to_sentence
  end

  def other_available_locales
    locales_for_reading_column(:title) - [I18n.locale.to_s]
  end

  def has_translators?
    locales_for_reading_column(:translators).include? I18n.locale
  end

  def translator_names
    JSON.parse translators
  end
  def translator_names=(t)
    translators = t.to_json
  end

  def readers_by_enrollment_status
    hash = Hash.new
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
