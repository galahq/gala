# frozen_string_literal: true

# A value object representing the contents of a {Card}
class ContentState
  EMPTY = {
    blocks: [
      {
        key: SecureRandom.base64,
        data: {},
        text: '',
        depth: 0,
        entityRanges: [],
        inlineStyleRanges: []
      }
    ],
    entityMap: {}
  }.with_indifferent_access.freeze

  attr_reader :data

  def self.for(data)
    return new EMPTY unless data.respond_to? :key?

    data = data.with_indifferent_access
    return new EMPTY unless %i[blocks entityMap].all? { |key| data&.key? key }

    new data
  end

  def initialize(data)
    @data = data
  end

  def as_json(*_args)
    data
  end

  def ==(other)
    data == other.data
  end

  def blocks
    data[:blocks]
  end

  def entity_map
    data[:entityMap]
  end

  def paragraphs
    blocks.map { |x| x[:text] }
  end
end

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
