# frozen_string_literal: true

# A page of narrative, consisting of multiple {Card}s and associated {Edgenote}s
#
# @attr title [String] the page’s title
# @attr icon_slug [?String] the slug of the icon to display in the TOC if the
#   page represents an activity
class Page < ApplicationRecord
  include Element
  include Lockable

  has_many :cards, -> { order position: :asc }, as: :element,
                                                dependent: :destroy
end
