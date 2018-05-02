# frozen_string_literal: true

# @see Podcast
class PodcastDecorator < ApplicationDecorator
  def artwork_url(transforms = { resize: '950x384^' })
    return DARK_BLUE_PIXEL unless artwork.attached?
    h.url_for artwork.variant transforms
  end

  def audio_url
    return nil unless audio.attached?
    h.url_for audio
  end
end
