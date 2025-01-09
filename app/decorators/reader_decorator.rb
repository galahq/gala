# frozen_string_literal: true

# @see Reader
class ReaderDecorator < ApplicationDecorator
  # @param size [:thumbnail]
  def image_url
    return model.image_url unless image.attached?
    ImageDecorator.decorate(image).resized_path(width: 100)
  end
end
