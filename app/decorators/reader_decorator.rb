# frozen_string_literal: true

# @see Reader
class ReaderDecorator < ApplicationDecorator
  # @param size [:thumbnail]
  def image_url(size = :thumbnail)
    return model.image_url unless image.attached?
    ImageDecorator.decorate(image).resized_path transforms(size)
  end

  def transforms(size)
    case size
    when :thumbnail
      { width: 100 }
    end
  end
end
