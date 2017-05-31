# frozen_string_literal: true

class Page < ApplicationRecord
  include Authority::Abilities

  belongs_to :case

  include Element

  has_many :cards, -> { order position: :asc }, as: :element,
                                                dependent: :destroy

  include Mobility
  translates :title
end
