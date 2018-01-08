# frozen_string_literal: true

# An attachment to a case that provides an engaging activity that the learners
# can do to solidify their understanding.
#
# @attr title [Translated<String>]
# @attr pdf_url [Translated<String>]
class Activity < ApplicationRecord
  include Authority::Abilities
  include Element
  include Mobility

  translates :title, :description, :pdf_url, fallbacks: true

  belongs_to :case, touch: true

  # @!method card
  #   @api private
  has_one :card, as: :element, dependent: :destroy

  after_create_commit -> { create_card }

  # @return [Array<Card>]
  def cards
    [card]
  end
end
