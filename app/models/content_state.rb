# frozen_string_literal: true

# A value object representing the contents of a {Card}
class ContentState
  attr_reader :blocks, :entity_map

  def self.for(data)
    return new unless data.respond_to? :key?

    data = data.with_indifferent_access
    return new unless %i[blocks entityMap].all? { |key| data&.key? key }

    new blocks: BlockList.for(data[:blocks]),
        entity_map: EntityMap.new(data[:entityMap])
  end

  def self.with_text(*text)
    blocks = BlockList.for(text.flatten.map { |t| { text: t } })
    new blocks: blocks
  end

  def initialize(blocks: BlockList.new, entity_map: EntityMap.new)
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

  def entities(type: nil)
    entity_map.grep(type: type)
              .sort_by do |(key, _entity)|
                blocks.range_for_entity(key)
              end
              .map(&:second)
              .map(&:data)
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
