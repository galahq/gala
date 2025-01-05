# frozen_string_literal: true

# Optimize, resize, and prepare urls for attached images
class ImageDecorator < ApplicationDecorator
  BLUE_PIXEL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADU' \
    'lEQVR42mNceOhRPQAHFwLGnBKLQwAAAABJRU5ErkJggg== '

  RED_PIXEL =
    'data:image/png;base64,iVBORw0KGgoAAAEAAAABCAYAAAFoEvQfAAAABG' \
    'dBTUEAALGPC/xhBQAAAA1JREFUCB1juOtg/x8ABbYCXHCMAk8AAAAASUVORK5CYII='

  def resized_path(**options)
    return BLUE_PIXEL unless attached?
    return RED_PIXEL unless variable?

    polymorphic_path(resized(**options), only_path: false)
  end

  def resized_url(**options)
    polymorphic_url(resized(**options), only_path: false)
  end

  def resized_file(**options)
    return nil unless attached?

    resized(**options).processed.blob.download
  end

  private

  def resized(width: nil, height: nil, **options)
    transforms = resize_options(width, height).merge(options).merge(optimizations)
    variant(transforms)
  end

  def optimizations
    return jpeg_optimizations if jpeg?

    base_optimizations
  end

  def jpeg_optimizations
    base_optimizations
      .merge(saver: { strip: true, quality: 85, interlace: true })
  end

  def base_optimizations
    { saver: { strip: true } }
  end

  def resize_options(width, height)
    return {} if width.blank?

    height ||= width
    { resize_to_limit: [width, height] }
  end

  def jpeg?
    return false unless attached?

    content_type.include? 'jpeg'
  end
end
