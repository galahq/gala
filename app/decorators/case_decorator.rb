# frozen_string_literal: true

DARK_BLUE_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADU' \
  'lEQVR42mOUtY/7DwAC9gG7VNK2ygAAAABJRU5ErkJggg=='

RED_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAFoEvQfAAAABG' \
  'dBTUEAALGPC/xhBQAAAA1JREFUCB1juOtg/x8ABbYCXHCMAk8AAAAASUVORK5CYII='

# @see Case
class CaseDecorator < ApplicationDecorator
  decorates_association :edgenotes
  decorates_association :podcasts

  def cover_url(transforms = { resize: '1280x540^' })
    return DARK_BLUE_PIXEL unless cover_image.attached?
    return RED_PIXEL unless cover_image.variable?
    polymorphic_path cover_image.variant(transforms), only_path: true
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

  def other_available_locales
    translations.each_with_object({}) do |kase, table|
      table[kase.locale] =
        polymorphic_path kase, locale: I18n.locale, only_path: true
    end
  end
end
