# frozen_string_literal: true

module Readers
  # Tier 1, step one: close an account (register A22).
  #
  # Nothing is destroyed yet. The reader is flagged closed, which hides their
  # identity from everyone else from this moment, and a pending
  # {AccountDeletionRequest} is recorded for the sweep to act on after the
  # 30-day grace period. The row keeps its real name, email and password for
  # that window so the reader can sign back in and {RestoreAccount}, and so a
  # Tier 2 erasure request can still be matched to them (A14).
  #
  # Edit locks are released immediately: they block other editors and have
  # no value to a departing reader.
  #
  # Takes the reader's row lock, so concurrent closes raise {AlreadyClosed}
  # rather than tripping the one-pending-request index.
  class CloseAccount
    class AlreadyClosed < StandardError; end

    def self.call(reader, now: Time.current)
      new(reader, now: now).call
    end

    def initialize(reader, now: Time.current)
      @reader = reader
      @now = now
    end

    # @return [AccountDeletionRequest] the pending request
    def call
      request = @reader.with_lock do
        # with_lock reloads, so this sees a close made through another copy.
        raise AlreadyClosed, "reader #{@reader.id} is already closed" if @reader.closed?

        record_request
      end
      CleanupLocksJob.perform_now(reader_id: @reader.id)
      request
    end

    private

    def record_request
      @reader.update_columns(closed_at: @now, updated_at: @now)
      @reader.account_deletion_requests.create!(
        requested_at: @now,
        scheduled_for: @now + AccountDeletionRequest::GRACE_PERIOD
      )
    end
  end
end
