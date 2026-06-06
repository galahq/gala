# frozen_string_literal: true

class ContentTypeValidator < ActiveModel::EachValidator
  include ActiveStorageAttachmentValidatorSupport

  def validate_each(record, attribute, _value)
    allowed = Array(option_value(record, :in) || option_value(record, :with))
    return if allowed.empty?

    each_blob(record, attribute) do |blob|
      next if allowed.include?(blob.content_type)

      record.errors.add(attribute, custom_message || 'has an invalid content type')
    end
  end
end
