# frozen_string_literal: true

# @see Reader
class ReaderDecorator < Draper::Decorator
  delegate_all

  # @param size [:thumbnail]
  def image_url(size = :thumbnail)
    return model.image_url unless image.attached?

    case size
    when :thumbnail
      h.url_for(image.variant(thumbnail: '100x100^'))
    end
  end
end
