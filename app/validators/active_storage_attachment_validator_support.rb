# frozen_string_literal: true

module ActiveStorageAttachmentValidatorSupport
  private

  def each_blob(record, attribute)
    attachment = record.public_send(attribute)
    return unless attachment.respond_to?(:attached?) && attachment.attached?

    blobs_for(attachment).each { |blob| yield blob if blob }
  end

  def blobs_for(attachment)
    if attachment.respond_to?(:blobs)
      attachment.blobs
    elsif attachment.respond_to?(:blob)
      Array(attachment.blob)
    elsif attachment.respond_to?(:attachments)
      attachment.attachments.map(&:blob)
    else
      []
    end
  end

  def option_value(record, key)
    value = options[key]
    value.respond_to?(:call) ? value.call(record) : value
  end

  def custom_message
    options[:message]
  end
end
