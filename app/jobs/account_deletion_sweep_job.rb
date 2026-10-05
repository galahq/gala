# frozen_string_literal: true

# Anonymizes every account whose closure grace period has passed. Enqueued
# daily by `rake accounts:sweep_closures` from Heroku Scheduler (register A10:
# state in Postgres, a scheduled sweep as the trigger).
#
# The batch is read without locks, so by the time a request comes up the
# reader may have signed back in. Each one is therefore re-checked under the
# reader's row lock, the same lock {Readers::RestoreAccount} takes, and
# skipped unless it is still pending, still due, and the reader still closed.
#
# One account failing must not stop the rest: each failure is logged and
# reported to Sentry with ids only, and the request stays pending for the next
# run.
# @see Readers::AnonymizeAccount
class AccountDeletionSweepJob < ApplicationJob
  queue_as :default

  def perform(now: Time.current)
    AccountDeletionRequest.due(now).find_each do |request|
      sweep_one(request, now: now)
    rescue StandardError => e
      report_failure(request, e)
    end
  end

  # @return [Boolean] whether the account was anonymized
  def sweep_one(request, now: Time.current)
    reader = request.reader
    reader.with_lock do
      request.reload
      next false unless still_due?(request, reader, now)

      Readers::AnonymizeAccount.call(reader, now: now)
      true
    end
  end

  private

  def still_due?(request, reader, now)
    request.pending? && request.scheduled_for <= now &&
      reader.closed? && !reader.anonymized?
  end

  def report_failure(request, error)
    Rails.logger.error <<~MESSAGE
      AccountDeletionSweepJob: request #{request.id} (reader #{request.reader_id}) failed: #{error.class}: #{error.message}
    MESSAGE
    return unless defined?(Sentry)

    Sentry.capture_exception(
      error,
      extra: { account_deletion_request_id: request.id, reader_id: request.reader_id }
    )
  end
end
