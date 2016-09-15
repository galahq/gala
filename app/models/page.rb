class Page < ApplicationRecord
  include Authority::Abilities
  belongs_to :case
  acts_as_list scope: :case

  has_many :cards, -> { order position: :asc }, dependent: :destroy
  translates :title
end
