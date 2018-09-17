# frozen_string_literal: true

class ContentState
  # The type for the ActiveModel attributes API
  class Type < ActiveModel::Type::Value
    def type
      :jsonb
    end

    def cast(value)
      return value if value.is_a? ContentState
      ContentState.for value
    end

    def deserialize(value)
      decoded = ::ActiveSupport::JSON.decode value rescue nil
      ContentState.for decoded
    end

    def serialize(value)
      ::ActiveSupport::JSON.encode value
    end

    def changed_in_place?(raw_old_value, new_value)
      raw_old_value != serialize(new_value)
    end
  end
end
