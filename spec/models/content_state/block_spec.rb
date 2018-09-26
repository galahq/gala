# frozen_string_literal: true

require 'rails_helper'

describe ContentState::Block do
  let(:block_contents) do
    {
      key: SecureRandom.base64,
      data: {},
      text: 'Hello, world!',
      depth: 0,
      type: 'unstyled',
      entityRanges: [],
      inlineStyleRanges: []
    }.with_indifferent_access
  end

  let(:block) { described_class.new block_contents }

  describe '::new' do
    it 'can be initialized with json' do
      block = described_class.new block_contents
      expect(block.as_json).to eq block_contents
    end

    it 'can be initialized with a partial hash of attributes' do
      block = described_class.new(text: 'Hello, world!')
      expect(block.as_json).to have_key :key
      expect(block.text).to eq 'Hello, world!'
    end

    it 'is initialized empty without arguments' do
      block = described_class.new
      expect(block.as_json).to have_key :key
      expect(block.text).to eq ''
    end
  end

  describe '#text' do
    it 'returns the plain text contents of the block' do
      expect(block.text).to eq 'Hello, world!'
    end
  end

  describe '#text=' do
    it 'sets the plain text contents of the block' do
      block.text = 'What’s up?'
      expect(block.text).to eq 'What’s up?'
    end
  end

  describe '#type' do
    it 'returns the type of the block' do
      expect(block.type).to eq 'unstyled'
    end
  end

  describe '#text=' do
    it 'sets the type of the block' do
      block.type = 'header-two'
      expect(block.type).to eq 'header-two'
    end
  end

  describe '#add_entity_range' do
    it 'leaves the block unchanged if given an invalid range' do
      block.add_entity_range 'key', length: 100, offset: 100
      expect(block.as_json).to eq block_contents
    end

    it 'adds the entity range if given a valid range' do
      block.add_entity_range 'key', length: 5, offset: 0
      expect(block.entity_ranges).to include(key: 'key', length: 5, offset: 0)
    end
  end
end
