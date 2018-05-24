# frozen_string_literal: true

# Prepares a PORO for use with ActiveModelSerializers
module Serializable
  extend ActiveSupport::Concern

  alias read_attribute_for_serialization send

  class_methods do
    def serialize_with(serializer)
      define_method :serializer_class do
        serializer
      end
    end
  end
end
