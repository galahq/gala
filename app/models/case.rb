class Case < ApplicationRecord
  include Authority::Abilities
  include Comparable

  translates :title, :summary, :narrative
  enum catalog_position: %i(in_index featured)

  has_many :edgenotes
  has_many :podcasts, -> { order position: :asc }
  has_many :activities, -> { order position: :asc }
  has_many :comment_threads
  has_many :comments, through: :comment_threads
  has_many :enrollments
  has_many :readers, through: :enrollments
  has_many :pages, -> { order position: :asc }
  has_many :cases, through: :pages

  scope :published, -> { where(published: true)  }

  validates :publication_date, presence: true, if: :published?

  def <=>(anOther)
    if published ^ anOther.published
      return published ? -1 : 1
    elsif publication_date == nil || anOther.publication_date == nil
      return publication_date.nil? ? 1 : -1
    end
    publication_date <=> anOther.publication_date
  end

  def to_param
    slug
  end

  def case_authors
    authors.to_sentence
  end

end
