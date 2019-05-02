# frozen_string_literal: true

# @see Card
class CardDecorator < ApplicationDecorator
  # Find the edgenote objects from the case’s association to take advantage of
  # preloading
  def edgenotes
    object.case.edgenotes.select do |edgenote|
      raw_content.edgenote_slugs.include? edgenote.slug
    end.map(&:decorate)
  end
end
