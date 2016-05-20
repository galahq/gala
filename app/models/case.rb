class Case < ApplicationRecord
  has_many :edgenotes
  has_many :podcasts
  has_many :activities
  has_many :comment_threads
  has_many :comments, through: :comment_threads
  has_many :enrollments
  has_many :readers, through: :enrollments

  translates :title, :summary, :narrative
end
