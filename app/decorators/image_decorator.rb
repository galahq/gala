# frozen_string_literal: true

# Optimize, resize, and prepare urls for attached images
class ImageDecorator < ApplicationDecorator
  BLUE_PIXEL = <<~ENCODING.gsub(/\s+/, '')
    data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADU
    lEQVR42mNceOhRPQAHFwLGnBKLQwAAAABJRU5ErkJggg==
  ENCODING

  RED_PIXEL = <<~ENCODING.gsub(/\s+/, '')
    data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAFoEvQfAAAABG
    dBTUEAALGPC/xhBQAAAA1JREFUCB1juOtg/x8ABbYCXHCMAk8AAAAASUVORK5CYII=
  ENCODING

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

  def resized(**options)
    width = options.delete(:width)
    height = options.delete(:height)
    sharpen = options.delete(:sharpen)
    transforms = resize_options(width, height).merge(options).merge(optimizations)
    transforms[:sharpen] = { sigma: sharpen } if sharpen
    variant(transforms)
  end

  def optimizations
    return jpeg_optimizations if jpeg?

    base_optimizations
  end

  def jpeg_optimizations
    base_optimizations
      .merge(saver: {
               'sampling-factor': 4,
               quality: 85,
               colorspace: 'sRGB',
               interlace: 'line'
             })
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

    content_type.include?('jpeg')
  end
end
