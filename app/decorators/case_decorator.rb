# frozen_string_literal: true

# @see Case
class CaseDecorator < Draper::Decorator
  delegate_all

  DARK_BLUE_PIXEL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADU' \
    'lEQVR42mOUtY/7DwAC9gG7VNK2ygAAAABJRU5ErkJggg=='

  def cover_url
    return DARK_BLUE_PIXEL unless cover_image.attached?
    h.url_for(cover_image.variant(resize: '1280x540^'))
  end

  def small_cover_url
    return DARK_BLUE_PIXEL unless cover_image.attached?
    h.url_for(cover_image.variant(thumbnail: '200x200^'))
  end
end
