# frozen_string_literal: true

module Readers
  # Undo a closure inside the grace period (register A22): the reader signed
  # back in. Clears the flag and marks the pending request restored. Nothing
  # was destroyed by {CloseAccount}, so the account is exactly as it was.
  #
  # Not possible once the sweep has run: an anonymized account has no identity
  # left to restore.
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
      raise NotRestorable, "reader #{@reader.id} is not closed" unless @reader.closed?
      raise NotRestorable, "reader #{@reader.id} is already anonymized" if @reader.anonymized?

      ActiveRecord::Base.transaction do
        @reader.pending_account_deletion_request&.update!(restored_at: @now)
        @reader.update_columns(closed_at: nil, updated_at: @now)
      end

      @reader.reload
    end
  end
end
