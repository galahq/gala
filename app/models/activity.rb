# frozen_string_literal: true

# An attachment to a case that provides an engaging activity that the learners
# can do to solidify their understanding.
#
# @attr title [Translated<String>]
class Activity < ApplicationRecord
  include Element
  include Mobility

  translates :title, :description, fallbacks: true

  # @!method card
  #   @api private
  #   Prefer {cards}
  has_one :card, as: :element, dependent: :destroy, required: true

  has_one_attached :pdf

  before_validation :build_card, on: :create

  # @return [Array<Card>]
  def cards
    [card]
  end
end
