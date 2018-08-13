# frozen_string_literal: true

# An attachment to a case that provides an engaging activity that the learners
# can do to solidify their understanding.
#
# @attr title [String]
# @attr pdf_url [String]
class Activity < ApplicationRecord
  include Element
  include Lockable

  # @!method card
  #   @api private
  #   Prefer {cards}
  has_one :card, as: :element, dependent: :destroy, required: true

  before_validation :build_card, on: :create, unless: -> { card.present? }

  # @return [Array<Card>]
  def cards
    [card]
  end
end
