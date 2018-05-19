# frozen_string_literal: true

# A page of narrative, consisting of multiple {Card}s and associated {Edgenote}s
#
# @attr title [Translated<String>] the page’s title
class Page < ApplicationRecord
  include Element
  include Mobility
  include Watchable

  translates :title, fallbacks: true

  has_many :cards, -> { order position: :asc }, as: :element,
                                                dependent: :destroy
end
