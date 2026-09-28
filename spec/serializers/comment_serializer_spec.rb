# frozen_string_literal: true

require 'rails_helper'

# Regression coverage for the nil-reader crash: a comment whose reader has
# been removed used to raise inside the reader serializer, which took the
# whole thread down for every participant.
RSpec.describe CommentSerializer do
  let(:comment) { create :comment }

  before { comment.update_columns(reader_id: nil) }

  it 'serializes a comment whose reader no longer exists' do
    json = ActiveModelSerializers::SerializableResource
           .new(comment.reload, serializer: described_class).as_json

    expect(json[:id]).to eq comment.id
    expect(json[:reader]).to include(id: nil, name: 'Deleted reader')
  end
end
