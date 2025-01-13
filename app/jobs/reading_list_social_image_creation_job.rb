# frozen_string_literal: true

# Create an OpenGraph image for a reading list by tiling its cases’ cover
# images.
class ReadingListSocialImageCreationJob < ActiveJob::Base
  before_perform :setup
  after_perform :cleanup

  delegate :cases, to: :@reading_list

  def perform(reading_list)
    @reading_list = reading_list

    if cover_images.any?
      @reading_list.social_image.attach io: image, filename: 'social.jpg'
    else
      @reading_list.social_image.detach
    end
  end

  private

  def setup
    @cover_images = []
  end

  def image
    CaseGrid.generate(*cover_images).then do |magick_image|
      magick_image.format = 'jpg'
      StringIO.new magick_image.to_blob
    end
  end

  def cover_images
    @cover_images = cases.map do |kase|
      next unless kase.cover_image.attached?

      decorator = ImageDecorator.decorate(kase.cover_image)
      readable_file decorator.resized_file(**options)
    end.compact
  end

  def readable_file(contents)
    tempfile = Tempfile.create
    tempfile.binmode
    tempfile.write contents
    tempfile.close
    File.open tempfile
  end

  def options
    { width: 200, height: 200, sharpen: '0x1' }
  end

  def cleanup
    @cover_images.map do |tempfile|
      tempfile.close
      File.unlink tempfile
    end
  end
end
