# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Readers::CloseAccount do
  subject(:reader) { create :reader, name: 'Real Name' }

  let(:now) { Time.zone.parse('2026-10-12 10:00:00') }

  it 'records a pending request scheduled 30 days out' do
    request = described_class.call(reader, now: now)

    expect(request).to be_pending
    expect(request.requested_at).to eq now
    expect(request.scheduled_for).to eq now + 30.days
    expect(reader.reload.pending_account_deletion_request).to eq request
  end

  it 'flags the reader closed without destroying anything' do
    enrollment = create :enrollment, reader: reader
    comment = create :comment, reader: reader

    described_class.call(reader, now: now)

    expect(reader.reload).to be_closed
    expect(reader).not_to be_anonymized
    expect(reader.closed_at).to eq now
    expect(enrollment.reload).to be_persisted
    expect(comment.reload.reader).to eq reader
  end

  it 'hides the identity from everyone else but keeps it on the row for restore' do
    described_class.call(reader, now: now)
    reader.reload

    expect(reader.name).to eq 'Deleted user'
    expect(reader.read_attribute(:name)).to eq 'Real Name'
    expect(reader.decorate.image_url).to be_nil
    expect(reader.valid_password?('secret')).to be true
  end

  it 'releases the edit locks the reader holds' do
    create :lock, reader: reader

    expect { described_class.call(reader, now: now) }.to change(Lock, :count).by(-1)
  end

  it 'refuses to close an account twice' do
    described_class.call(reader, now: now)

    expect { described_class.call(reader.reload, now: now) }
      .to raise_error(Readers::CloseAccount::AlreadyClosed)
    expect(AccountDeletionRequest.where(reader: reader).count).to eq 1
  end

  it 'raises AlreadyClosed, not a uniqueness error, when another copy closed it first' do
    stale = Reader.find(reader.id)
    described_class.call(reader, now: now)

    expect { described_class.call(stale, now: now) }
      .to raise_error(Readers::CloseAccount::AlreadyClosed)
  end

  it 'drops the reader out of the active scope' do
    described_class.call(reader, now: now)

    expect(Reader.active).not_to include(reader)
  end
end
