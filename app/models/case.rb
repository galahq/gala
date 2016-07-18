class Case < ApplicationRecord
  include Authority::Abilities
  include Comparable

  translates :title, :summary, :narrative
  enum catalog_position: %i(in_index featured)

  has_many :edgenotes
  has_many :podcasts
  has_many :activities
  has_many :comment_threads
  has_many :comments, through: :comment_threads
  has_many :enrollments
  has_many :readers, through: :enrollments

  scope :published, -> { where(published: true)  }

  def <=>(anOther)
    return -1 if published
    publication_date <=> anOther.publication_date
  end

  def to_param
    slug
  end

  def case_authors
    authors.to_sentence
  end

  def segments
    narrative.split(/(?:<h1.*?>(.*?)<\/h1>)/)[1..-1].each_slice(2).to_a
  end

end
