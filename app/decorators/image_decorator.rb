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

    polymorphic_path(object, only_path: false)
  end

  def resized_url(**options)
    return nil unless attached?

    polymorphic_url(object, only_path: false)
  end

  def resized_file(**options)
    return nil unless attached?

    blob.download
  end
end
