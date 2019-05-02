# frozen_string_literal: true

# @see Card
class CardDecorator < ApplicationDecorator
  # Find the edgenote objects from the case’s association to take advantage of
  # preloading
  def edgenotes
    edgenote_slugs.map do |slug|
      object.case.edgenotes.find do |edgenote|
        edgenote.slug == slug
      end
    end.map(&:decorate)
  end

  def edgenote_slugs
    raw_content.entities(type: :EDGENOTE).map { |e| e[:slug] }
  end
end
