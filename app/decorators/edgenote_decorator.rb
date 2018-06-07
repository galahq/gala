# frozen_string_literal: true

require './app/decorators/case_decorator.rb'

# @see Edgenote
class EdgenoteDecorator < ApplicationDecorator
  # We can’t delegate format because it gets confused with Kernel#format somehow
  def format
    object.format
  end

  def image_url(transforms = {})
    return nil unless image.attached?
    return RED_PIXEL unless image.variable?
    polymorphic_path image.variant(transforms), only_path: true
  end

  def image_thumbnail_url
    image_url resize: thumbnail_width
  end

  def audio_url
    return nil unless audio.attached?
    polymorphic_path audio, only_path: true
  end

  def thumbnail_width
    highlighted ? '2500' : '640'
  end
end
