# frozen_string_literal: true

# @see Edgenote
class EdgenoteDecorator < ApplicationDecorator
  # We can’t delegate format because it gets confused with Kernel#format somehow
  def format
    object.format
  end

  def image_url(transforms = {})
    return nil unless image.attached?
    ImageDecorator.decorate(image).resized_path transforms
  end

  def image_thumbnail_url
    image_url width: thumbnail_width
  end

  def audio_url
    return nil unless audio.attached?
    polymorphic_path audio, only_path: true
  end

  def file_url
    return nil unless file.attached?
    polymorphic_path file, only_path: true
  end

  private

  def thumbnail_width
    highlighted ? '2500' : '640'
  end
end
