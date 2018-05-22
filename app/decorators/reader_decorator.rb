# frozen_string_literal: true

# @see Reader
class ReaderDecorator < ApplicationDecorator
  # @param size [:thumbnail]
  def image_url(size = :thumbnail)
    return model.image_url unless image.attached?

    case size
    when :thumbnail
      polymorphic_path image.variant(thumbnail: '100x100^'), only_path: true
    end
  end
end
