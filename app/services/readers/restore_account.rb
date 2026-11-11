# frozen_string_literal: true

module Readers
  # Undo a closure inside the grace period (register A22): the reader signed
  # back in. Clears the flag and marks the pending request restored. Nothing
  # was destroyed by {CloseAccount}, so the account is exactly as it was.
  #
  # Not possible once the sweep has run: an anonymized account has no identity
  # left to restore.
  #
  # Takes the reader's row lock, as {CloseAccount}, {AnonymizeAccount} and the
  # sweep do, so a restore and a day-30 scrub can never interleave.
  class RestoreAccount
    class NotRestorable < StandardError; end

    def self.call(reader, now: Time.current)
      new(reader, now: now).call
    end

    def initialize(reader, now: Time.current)
      @reader = reader
      @now = now
    end

    # @return [Reader]
    def call
      @reader.with_lock do
        raise NotRestorable, "reader #{@reader.id} is not closed" unless @reader.closed?
        raise NotRestorable, "reader #{@reader.id} is already anonymized" if @reader.anonymized?

        # By query, not through the has_one: a cached association can be a
        # stale nil and leave the request pending for the sweep to act on.
        @reader.account_deletion_requests.pending
               .update_all(restored_at: @now, updated_at: @now)
        @reader.update_columns(closed_at: nil, updated_at: @now)
      end

      @reader.reload
    end
  end
end
