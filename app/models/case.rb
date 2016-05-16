class Case < ApplicationRecord
  has_many :edgenotes

  translates :title, :summary, :narrative
end
