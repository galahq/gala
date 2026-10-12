# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AccountDeletionSweepJob do
  let(:now) { Time.zone.parse('2026-11-12 10:00:00') }

  it 'anonymizes accounts whose grace period has passed and leaves the rest' do
    due = create :reader
    recent = create :reader
    Readers::CloseAccount.call(due, now: now - 31.days)
    Readers::CloseAccount.call(recent, now: now - 5.days)

    described_class.perform_now(now: now)

    expect(due.reload).to be_anonymized
    expect(due.pending_account_deletion_request).to be_nil
    expect(recent.reload).not_to be_anonymized
    expect(recent.pending_account_deletion_request).to be_present
  end

  it 'ignores restored requests' do
    reader = create :reader
    Readers::CloseAccount.call(reader, now: now - 31.days)
    Readers::RestoreAccount.call(reader.reload, now: now - 20.days)

    described_class.perform_now(now: now)

    expect(reader.reload).not_to be_anonymized
  end

  it 'keeps going when one account fails' do
    first = create :reader
    second = create :reader
    Readers::CloseAccount.call(first, now: now - 31.days)
    Readers::CloseAccount.call(second, now: now - 31.days)
    allow(Readers::AnonymizeAccount).to receive(:call).and_call_original
    allow(Readers::AnonymizeAccount).to receive(:call).with(first, anything).and_raise('boom')
    allow(Rails.logger).to receive(:error)

    described_class.perform_now(now: now)

    expect(second.reload).to be_anonymized
    expect(first.reload).not_to be_anonymized
    expect(Rails.logger).to have_received(:error).with(/reader #{first.id}.*RuntimeError/m)
  end

  # A unique violation's DETAIL quotes the email; validation errors quote names.
  describe 'failure reports never carry the error message' do
    let(:reader) { create :reader }
    let!(:request) { Readers::CloseAccount.call(reader, now: now - 31.days) }
    let(:leaky) { 'Key (email)=(real.person@example.com) already exists' }

    before do
      allow(Readers::AnonymizeAccount).to receive(:call).and_raise(ActiveRecord::RecordNotUnique, leaky)
      allow(Rails.logger).to receive(:error)
      allow(Sentry).to receive(:capture_exception)
      described_class.perform_now(now: now)
    end

    it 'logs the class and ids' do
      expect(Rails.logger).to have_received(:error)
        .with("AccountDeletionSweepJob: request #{request.id} (reader #{reader.id}) " \
              'failed: ActiveRecord::RecordNotUnique')
    end

    it 'sends Sentry a stand-in with the class, ids and backtrace' do
      expect(Sentry).to have_received(:capture_exception).with(
        an_instance_of(AccountDeletionSweepJob::Failure)
          .and(having_attributes(message: /RecordNotUnique/, backtrace: be_present))
          .and(satisfy { |failure| !failure.message.include?('example.com') && failure.cause.nil? }),
        extra: { account_deletion_request_id: request.id, reader_id: reader.id }
      )
    end
  end

  # The batch is read without locks. These reproduce the reviewer's probe:
  # a request loaded as due, then restored before its turn came.
  describe 'state that changed after the batch was loaded' do
    let(:reader) { create :reader }

    before { Readers::CloseAccount.call(reader, now: now - 31.days) }

    it 'skips a reader who signed back in after the batch was loaded' do
      stale_request = AccountDeletionRequest.due(now).find_by!(reader: reader)
      Readers::RestoreAccount.call(reader.reload, now: now - 1.hour)

      expect(described_class.new.sweep_one(stale_request, now: now)).to be false
      expect(reader.reload).not_to be_anonymized
      expect(reader).not_to be_closed
    end

    it 'skips and reports a request that is pending but whose reader is no longer closed' do
      stale_request = AccountDeletionRequest.due(now).find_by!(reader: reader)
      reader.update_columns(closed_at: nil)
      allow(Sentry).to receive(:capture_message)

      expect(described_class.new.sweep_one(stale_request, now: now)).to be false
      expect(reader.reload).not_to be_anonymized
      expect(Sentry).to have_received(:capture_message)
        .with(/request #{stale_request.id} skipped, reader #{reader.id} closed=false/)
    end

    it 'does not report a reader who signed back in, which is the normal case' do
      stale_request = AccountDeletionRequest.due(now).find_by!(reader: reader)
      Readers::RestoreAccount.call(reader.reload, now: now - 1.hour)
      allow(Sentry).to receive(:capture_message)

      described_class.new.sweep_one(stale_request, now: now)

      expect(Sentry).not_to have_received(:capture_message)
    end

    it 'anonymizes a request that is still due' do
      request = AccountDeletionRequest.due(now).find_by!(reader: reader)

      expect(described_class.new.sweep_one(request, now: now)).to be true
      expect(reader.reload).to be_anonymized
    end
  end
end
