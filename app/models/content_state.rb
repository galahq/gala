# frozen_string_literal: true

# A value object representing the contents of a {Card}
class ContentState
  attr_reader :blocks, :entity_map

  def self.for(data)
    return new unless data.respond_to? :key?

    data = data.with_indifferent_access
    return new unless %i[blocks entityMap].all? { |key| data&.key? key }

    new blocks: data[:blocks].map { |block| Block.new block },
        entity_map: data[:entityMap]
  end

  def self.with_text(*text)
    blocks = text.flatten.map { |t| Block.new text: t }
    new blocks: blocks
  end

  def initialize(blocks: [Block.new], entity_map: {})
    @blocks = blocks
    @entity_map = entity_map
  end

  def paragraphs
    blocks.map(&:text)
  end

  def selection(range)
    blocks[range.block_index]&.slice range.start, range.length
  end

  def add_edgenote(edgenote, range:)
    return self unless selection range

    key = SecureRandom.hex(16)
    add_entity_range range, key: key
    add_edgenote_entity edgenote, key: key
  end

  def data
    {
      blocks: blocks,
      entityMap: entity_map
    }.transform_values(&:as_json).with_indifferent_access
  end

  def as_json(*_args)
    data
  end

  def ==(other)
    data == other.data
  end

  private

  def add_entity_range(range, key:)
    block = blocks[range.block_index]
    block.add_entity_range key, length: range.length, offset: range.start
  end

  def add_edgenote_entity(edgenote, key:)
    entity_map[key] =
      { data: edgenote.slice(:slug), type: :EDGENOTE, mutability: :MUTABLE }
  end
end
