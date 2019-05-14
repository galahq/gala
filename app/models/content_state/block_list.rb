# frozen_string_literal: true

class ContentState
  # A list of Draft.js blocks
  class BlockList
    attr_reader :array

    delegate_missing_to :array

    def self.for(blocks)
      return new unless blocks.respond_to? :map

      new(blocks.map { |block| Block.new block })
    end

    def initialize(array = [Block.new])
      @array = array
    end

    def range_for_entity(key)
      array.each_with_index do |block, block_index|
        block.entity_ranges.each do |range|
          if range[:key].to_s == key.to_s
            return ContentState::Range.new(
              block_index, range[:offset], range[:length]
            )
          end
        end
      end
      nil
    end

    def as_json
      array.map(&:as_json)
    end
  end
end
