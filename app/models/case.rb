class Case < ApplicationRecord
  has_many :edgenotes
  has_many :podcasts
  has_many :activities
  has_many :comment_threads
  has_many :comments, through: :comment_threads
  has_many :enrollments
  has_many :readers, through: :enrollments

  translates :title, :summary, :narrative

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
