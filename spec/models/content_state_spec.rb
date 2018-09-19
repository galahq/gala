# frozen_string_literal: true

require 'rails_helper'

describe ContentState do
  let(:raw_content) do
    {
      blocks: [
        {
          key: SecureRandom.base64,
          data: {},
          text: 'Hello, world!',
          depth: 0,
          type: 'unstyled',
          entityRanges: [],
          inlineStyleRanges: []
        }
      ],
      entityMap: {}
    }.with_indifferent_access
  end

  let(:content_state) { described_class.for raw_content }

  let(:invalid_range) do
    instance_double 'ContentState::Range', block_index: 10, start: 0, length: 0
  end

  let(:valid_range) do
    instance_double 'Content_state::Range', block_index: 0, start: 3, length: 5
  end

  describe '::for' do
    it 'can be initialized with json' do
      content_state = described_class.for raw_content
      expect(content_state.as_json).to eq raw_content
    end

    it 'is initialized empty without any arguments' do
      expect(described_class.new)
    end
  end

  describe '::with_text' do
    it 'can be initialized with one paragraph' do
      content_state = described_class.with_text 'Hello, world!'
      expect(content_state.paragraphs).to eq ['Hello, world!']
    end

    it 'can be initialized with multiple paragraphs' do
      paragraphs = ['Dear Mom,', 'Thank you!', 'Love, Cameron']
      content_state = described_class.with_text paragraphs
      expect(content_state.paragraphs).to eq paragraphs
    end
  end

  describe '#paragraphs' do
    it 'returns an array of paragraph text' do
      expect(content_state.paragraphs).to eq ['Hello, world!']
    end
  end

  describe '#selection' do
    it 'returns nil for an invalid range' do
      expect(content_state.selection(invalid_range)).to be_nil
    end

    it 'returns the segment of text specified by a valid range' do
      expect(content_state.selection(valid_range)).to eq 'lo, w'
    end
  end

  describe '#add_edgenote' do
    let(:edgenote) do
      attrs = { slug: 'slug' }
      mock = instance_double('Edgenote', attrs)
      allow(mock).to receive(:slice).with(:slug).and_return attrs
      mock
    end

    it 'leaves the content state unchanged if given an invalid range' do
      content_state.add_edgenote edgenote, range: invalid_range
      expect(content_state.as_json).to eq raw_content
    end

    it 'adds the edgenote entity' do
      content_state.add_edgenote edgenote, range: valid_range
      expect(content_state.entity_map).to satisfy 'have matching entity' do |v|
        v.any? { |_key, value| value[:data] == { 'slug' => edgenote.slug } }
      end
    end

    it 'adds an entity range to the right block' do
      right_block = spy('right_block')
      allow(right_block).to receive(:slice).and_return true
      wrong_block = spy('wrong_block')

      content_state = described_class.new blocks: [right_block, wrong_block]
      content_state.add_edgenote edgenote, range: valid_range

      expect(right_block).to have_received(:add_entity_range)
        .with(anything, length: valid_range.length, offset: valid_range.start)
      expect(wrong_block).not_to have_received :add_entity_range
    end
  end
end
