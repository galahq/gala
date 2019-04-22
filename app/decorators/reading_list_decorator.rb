# @see ReadingList
class ReadingListDecorator < ApplicationDecorator
  def social_image_url
    return nil unless social_image.attached?

    polymorphic_url social_image, host: context[:host]
  end
end
