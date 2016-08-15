class Page < ApplicationRecord
  belongs_to :case
  acts_as_list scope: :case

  has_many :cards, -> { order position: :asc }
  translates :title
end
