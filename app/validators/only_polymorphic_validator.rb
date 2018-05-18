# frozen_string_literal: true

# Ensure that the type column of a model that belongs to a polymorphic role
# corresponds to a class that fills that role.
class OnlyPolymorphicValidator < ActiveModel::EachValidator
  DEFAULT_MESSAGE = 'isn’t a polymorphic type'

  def validate_each(record, attribute, value)
    role = attribute.to_s.delete_suffix '_type'
    klass = safe_constantize value
    singular_association_name = record.class.name.underscore

    return if polymorphic_association? klass, singular_association_name, role

    record.errors[attribute] << (options[:message] || DEFAULT_MESSAGE)
  end

  private

  def safe_constantize(value)
    value.constantize
  rescue NameError
    nil
  end

  def polymorphic_association?(klass, association_name, role)
    association = klass.reflect_on_association association_name
    association ||= klass.reflect_on_association association_name.pluralize
    association&.options&.[](:as) == role.to_sym
  end
end
