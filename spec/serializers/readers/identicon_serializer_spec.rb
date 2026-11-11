# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Readers::IdenticonSerializer do
  def serialize(reader)
    ActiveModelSerializers::SerializableResource
      .new(reader, serializer: described_class).as_json
  end

  it 'serializes a real reader' do
    reader = create :reader, name: 'Real Reader'

    expect(serialize(reader)).to include(
      id: reader.id, name: 'Real Reader', hashKey: reader.hash_key,
      type: 'Reader', table: 'readers'
    )
  end

  # `Reader has_many :comments, dependent: :nullify`, so a comment can outlive
  # its reader. The conversation components read `reader.hashKey`, `.name`
  # and `.id` without guarding, so a nil must become a stand-in, not `null`.
  context 'with no reader' do
    subject(:json) { serialize(nil) }

    it 'serializes a stand-in shaped like a reader' do
      expect(json).to include(
        id: nil, param: nil, name: 'Deleted user', imageUrl: nil,
        type: 'Reader', table: 'readers'
      )
    end

    it 'has a stable hash key so the identicon gradient does not change' do
      expect(json[:hashKey]).to match(/\A\h{64}\z/)
      expect(json[:hashKey]).to eq serialize(nil)[:hashKey]
    end

    it 'does not match any real reader' do
      reader = create :reader

      expect(json[:hashKey]).not_to eq reader.hash_key
      expect(json[:id]).not_to eq reader.id
    end
  end
end
