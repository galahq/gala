# frozen_string_literal: true

require 'active_model/type'

module TimeForABoolean
  def time_for_a_boolean(attribute, field = :"#{attribute}_at")
    define_method(attribute) do
      value = public_send(field)
      !value.nil? && value <= Time.current
    end

    alias_method :"#{attribute}?", attribute

    define_method(:"#{attribute}=") do |value|
      public_send(
        :"#{field}=",
        ActiveModel::Type::Boolean::FALSE_VALUES.include?(value) ? nil : Time.current
      )
    end

    define_method(:"#{attribute}!") do
      public_send(:"#{attribute}=", true)
    end
  end
end
