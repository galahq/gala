class Case < ApplicationRecord
  has_many :edgenotes
  has_many :podcasts

  translates :title, :summary, :narrative
end
