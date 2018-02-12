# frozen_string_literal: true

# @see Case
class CaseDecorator < Draper::Decorator
  delegate_all

  def cover_url
    h.url_for(cover_image.variant(resize: '1280x540^')) if cover_image.attached?
  end

  def small_cover_url
    if cover_image.attached?
      h.url_for(cover_image.variant(thumbnail: '200x200^'))
    end
  end
end
