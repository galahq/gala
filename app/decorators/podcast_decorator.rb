# frozen_string_literal: true

# @see Podcast
class PodcastDecorator < ApplicationDecorator
  def artwork_url(transforms = { width: 950, height: 384 })
    ImageDecorator.decorate(artwork).resized_path transforms
  end

  def audio_url
    return nil unless audio.attached?
    polymorphic_path audio, only_path: true
  end
end
