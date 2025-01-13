# frozen_string_literal: true

# @see Podcast
class PodcastDecorator < ApplicationDecorator
  # Find the card objects from the case’s association to take advantage of
  # preloading
  def cards
    object.case.cards.select do |card|
      card.element_type == 'Podcast' && card.element_id = object.id
    end.map(&:decorate)
  end

  def artwork_url(transforms = { width: 950, height: 384 })
    ImageDecorator.decorate(artwork).resized_path(**transforms)
  end

  def audio_url
    return nil unless audio.attached?

    polymorphic_path audio, only_path: true
  end
end
