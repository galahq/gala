# frozen_string_literal: true

# @see Page
class PageDecorator < ApplicationDecorator
  # Find the card objects from the case’s association to take advantage of
  # preloading
  def cards
    object.case.cards.select do |card|
      card.element_type == 'Page' && card.element_id = object.id
    end.map(&:decorate)
  end
end
