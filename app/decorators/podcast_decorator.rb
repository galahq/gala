# frozen_string_literal: true

# @see Podcast
class PodcastDecorator < ApplicationDecorator
  def artwork_url(transforms = { resize: '950x384^' })
    return DARK_BLUE_PIXEL unless artwork.attached?
    polymorphic_path artwork.variant(transforms), only_path: true
  end

  def audio_url
    return nil unless audio.attached?
    polymorphic_path audio, only_path: true
  end
end
