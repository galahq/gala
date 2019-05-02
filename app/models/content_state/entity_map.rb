# frozen_string_literal: true

class ContentState
  # A key-value store of Draft.js Entity data
  class EntityMap
    # A Draft.js Entity
    class Entity
      attr_reader :hash

      def initialize(hash)
        @hash = hash.with_indifferent_access
      end

      %i[data type mutability].map do |method|
        define_method method do                  # def data
          hash[method]                           #   data[:data]
        end

        define_method :"#{method}=" do |value|   # def data=(value)
          hash[method] = value                   #   data[:data] = value
        end
      end

      def as_json
        { data: data, type: type, mutability: mutability }
      end
    end

    attr_reader :data

    def initialize(data = {})
      @data = data.transform_values { |hash| Entity.new(hash) }
    end

    def []=(key, value)
      data[key] = Entity.new(value)
    end

    def as_json
      data.transform_values(&:as_json)
    end

    def entities_of_type(type)
      data.values.select { |entity| entity.type == type }
    end
  end
end
