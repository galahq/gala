# frozen_string_literal: true

class SizeValidator < ActiveModel::EachValidator
  include ActiveStorageAttachmentValidatorSupport

  def validate_each(record, attribute, _value)
    each_blob(record, attribute) do |blob|
      next if valid_size?(record, blob.byte_size)

      record.errors.add(attribute, custom_message || 'has an invalid file size')
    end
  end

  private

  def valid_size?(record, size)
    if (range = option_value(record, :between))
      range.include?(size)
    elsif (limit = option_value(record, :less_than))
      size < limit
    elsif (limit = option_value(record, :less_than_or_equal_to))
      size <= limit
    elsif (limit = option_value(record, :greater_than))
      size > limit
    elsif (limit = option_value(record, :greater_than_or_equal_to))
      size >= limit
    else
      true
    end
  end
end
