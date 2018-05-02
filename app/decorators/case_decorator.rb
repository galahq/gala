# frozen_string_literal: true

DARK_BLUE_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADU' \
  'lEQVR42mOUtY/7DwAC9gG7VNK2ygAAAABJRU5ErkJggg=='

# @see Case
class CaseDecorator < ApplicationDecorator
  decorates_association :edgenotes
  decorates_association :podcasts

  def cover_url(transforms = { resize: '1280x540^' })
    return DARK_BLUE_PIXEL unless cover_image.attached?
    h.url_for(cover_image.variant(transforms))
  end

  def small_cover_url
    cover_url thumbnail: '200x200^'
  end

  def open_graph_cover_url
    cover_url resize: '1200x1200^'
  end

  def cover_image_attachment
    open(cover_image.variant(resize: '470x95^').processed.service_url).read
  end
end
