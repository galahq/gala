class Case < ApplicationRecord
  has_many :edgenotes
  has_many :podcasts
  has_many :activities

  translates :title, :summary, :narrative
end
