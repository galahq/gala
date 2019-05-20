# frozen_string_literal: true

class ContentState
  # A paragraph within a Draft.js ContentState
  class Block
    EMPTY = {
      data: {},
      text: '',
      depth: 0,
      type: 'unstyled',
      entityRanges: [],
      inlineStyleRanges: []
    }.freeze

    attr_reader :data

    delegate :slice, to: :text

    def initialize(data = nil)
      data ||= {}
      @data = empty.merge(data).with_indifferent_access
    end

    %i[text depth type].map do |method|
      define_method method do                  # def text
        data[method]                           #   data[:text]
      end

      define_method :"#{method}=" do |value|   # def text=(value)
        data[method] = value                   #   data[:text] = value
      end
    end

    def entity_ranges
      data[:entityRanges].map(&:with_indifferent_access)
    end

    def add_entity_range(key, length:, offset:)
      return self unless valid_range? length: length, offset: offset

      data[:entityRanges] << { key: key, length: length, offset: offset }
    end

    def as_json(*_args)
      data
    end

    private

    def empty
      { key: SecureRandom.base64 }.merge EMPTY
    end

    def valid_range?(length:, offset:)
      text.length >= length + offset
    end
  end
end
