# frozen_string_literal: true

# @see Edgenote
class EdgenoteDecorator < ApplicationDecorator
  # We can’t delegate format because it gets confused with Kernel#format somehow
  def format
    object.format
  end

  def image_url(**transforms)
    return nil unless image.attached?

    ImageDecorator.decorate(image).resized_path(**transforms)
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

  def print_attribute(attribute)
    value = send attribute
    return if value.blank?

    value = yield value if block_given?

    [
      h.content_tag(:dt, h.t("activerecord.attributes.edgenote.#{attribute}")),
      h.content_tag(:dd, value)
    ].join('').html_safe
  end

  private

  def thumbnail_width
    bottom_full_width? ? '2500' : '640'
  end
end
