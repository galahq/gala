# frozen_string_literal: true

require 'digest'
require 'json'
require 'stringio'
require 'vips'

module GalaImageVariants
  module_function

  CONTENT_TYPES = {
    'image/jpeg' => ['.jpg', 'image/jpeg'],
    'image/png' => ['.png', 'image/png'],
    'image/webp' => ['.webp', 'image/webp']
  }.freeze

  def processed_blob(attachment, **options)
    source_blob = blob_for(attachment)
    return source_blob unless source_blob&.variable?

    width, height = dimensions(options)
    return source_blob unless width

    key = variant_key(source_blob, options)
    ActiveStorage::Blob.find_by(key: key) ||
      create_variant_blob(source_blob, key, width, height, options)
  rescue ActiveRecord::RecordNotUnique
    ActiveStorage::Blob.find_by!(key: key)
  rescue Vips::Error => e
    Rails.logger.warn("GalaImageVariants failed blob_id=#{source_blob&.id}: #{e.message}")
    source_blob
  end

  def processed_bytes(attachment, **options)
    processed_blob(attachment, **options).download
  end

  def variable?(attachment)
    blob_for(attachment)&.variable?
  end

  def blob_for(attachment)
    attachment.respond_to?(:blob) ? attachment.blob : attachment
  end

  def dimensions(options)
    width = positive_integer(options[:width])
    height = positive_integer(options[:height]) || width
    [width, height]
  end

  def positive_integer(value)
    number = value.to_i
    number.positive? ? number : nil
  end

  def variant_key(source_blob, options)
    digest = Digest::SHA256.hexdigest(
      JSON.generate(options.transform_keys(&:to_s).sort.to_h)
    )

    "variants/#{source_blob.key}/#{digest}#{extension_for(source_blob.content_type)}"
  end

  def create_variant_blob(source_blob, key, width, height, options)
    bytes = resize(source_blob.download, width, height, source_blob.content_type, options)
    extension, content_type = output_format(source_blob.content_type)

    ActiveStorage::Blob.create_and_upload!(
      key: key,
      io: StringIO.new(bytes),
      filename: variant_filename(source_blob, extension),
      content_type: content_type,
      metadata: {
        identified: true,
        source_blob_id: source_blob.id,
        gala_variant: options.transform_keys(&:to_s)
      }
    )
  end

  def resize(input, width, height, content_type, options)
    image = Vips::Image.thumbnail_buffer(input, width, height: height, size: :down)
    image = sharpen(image, options[:sharpen]) if options[:sharpen].present?

    extension, = output_format(content_type)
    save_buffer(image, extension, content_type)
  end

  def sharpen(image, value)
    sigma = value.to_s.include?('x') ? value.to_s.split('x').last.to_f : value.to_f
    return image unless sigma.positive?

    image.sharpen(sigma: sigma)
  rescue Vips::Error
    image
  end

  def save_buffer(image, extension, content_type)
    return image.write_to_buffer(extension, Q: 85, strip: true, interlace: true) if content_type == 'image/jpeg'

    image.write_to_buffer(extension, strip: true)
  end

  def output_format(content_type)
    CONTENT_TYPES.fetch(content_type, CONTENT_TYPES.fetch('image/jpeg'))
  end

  def extension_for(content_type)
    output_format(content_type).first
  end

  def variant_filename(source_blob, extension)
    basename = source_blob.filename.base
    "#{basename}-variant#{extension}"
  end
end
