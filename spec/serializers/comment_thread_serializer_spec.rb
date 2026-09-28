# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommentThreadSerializer do
  let(:thread) { create :comment_thread }

  it 'serializes a thread with a comment whose reader no longer exists' do
    other = create :comment, comment_thread: thread
    create(:comment, comment_thread: thread).update_columns(reader_id: nil)

    json = ActiveModelSerializers::SerializableResource
           .new(thread.reload, serializer: described_class).as_json

    expect(json[:readers].map { |r| r[:id] }).to eq [other.reader_id]
  end
end
