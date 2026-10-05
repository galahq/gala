# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Readers::RestoreAccount do
  subject(:reader) { create :reader, name: 'Real Name' }

  let(:closed_at) { Time.zone.parse('2026-10-12 10:00:00') }
  let(:now) { closed_at + 10.days }

  context 'inside the grace period' do
    before { Readers::CloseAccount.call(reader, now: closed_at) }

    it 'puts the account back exactly as it was' do
      request = reader.reload.pending_account_deletion_request

      described_class.call(reader, now: now)
      reader.reload

      expect(reader).not_to be_closed
      expect(reader.name).to eq 'Real Name'
      expect(reader.decorate.image_url).to eq reader.read_attribute(:image_url)
      expect(request.reload.restored_at).to eq now
      expect(request).not_to be_pending
      expect(reader.pending_account_deletion_request).to be_nil
      expect(Reader.active).to include(reader)
    end

    it 'can be closed again afterwards' do
      described_class.call(reader, now: now)

      expect { Readers::CloseAccount.call(reader.reload, now: now + 1.day) }
        .to change(AccountDeletionRequest, :count).by(1)
    end
  end

  # The reviewer's probe: a reader object whose has_one was read (and cached
  # as nil) before the account was closed. Restoring through that object must
  # still clear the request, or the sweep later scrubs an account that is open
  # again. CloseAccount now reloads under its lock, which happens to clear the
  # cache, so the stale object is built directly: closed in memory, clean,
  # with the nil association still cached.
  it 'marks the request restored even when the association was cached as nil' do
    expect(reader.pending_account_deletion_request).to be_nil
    Readers::CloseAccount.call(Reader.find(reader.id), now: closed_at)
    reader.closed_at = closed_at
    reader.clear_changes_information

    described_class.call(reader, now: now)

    expect(AccountDeletionRequest.where(reader: reader).pending).to be_empty
    expect(AccountDeletionRequest.find_by!(reader: reader).restored_at).to eq now
  end

  it 'refuses when another copy of the reader has already been anonymized' do
    Readers::CloseAccount.call(reader, now: closed_at)
    stale = Reader.find(reader.id)
    Readers::AnonymizeAccount.call(reader.reload, now: closed_at + 31.days)

    expect { described_class.call(stale, now: closed_at + 32.days) }
      .to raise_error(Readers::RestoreAccount::NotRestorable, /anonymized/)
  end

  it 'refuses when the account is not closed' do
    expect { described_class.call(reader, now: now) }
      .to raise_error(Readers::RestoreAccount::NotRestorable)
  end

  it 'refuses once the sweep has anonymized the account' do
    Readers::CloseAccount.call(reader, now: closed_at)
    Readers::AnonymizeAccount.call(reader.reload, now: closed_at + 31.days)

    expect { described_class.call(reader.reload, now: closed_at + 32.days) }
      .to raise_error(Readers::RestoreAccount::NotRestorable)
  end
end
