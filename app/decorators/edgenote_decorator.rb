# frozen_string_literal: true

# @see Edgenote
class EdgenoteDecorator < ApplicationDecorator
  # We can’t delegate format because it gets confused with Kernel#format somehow
  def format
    object.format
  end

  def image_url(transforms = {})
    return nil unless image.attached?
    polymorphic_path image.variant(transforms), only_path: true
  end

  def image_thumbnail_url
    image_url resize: '640'
  end

  def audio_url
    return nil unless audio.attached?
    polymorphic_path audio, only_path: true
  end
end
