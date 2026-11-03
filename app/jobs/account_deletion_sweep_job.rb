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
# A request that is pending and due but whose reader is no longer closed, or
# is already anonymized, was changed outside the services. It is skipped and
# reported rather than resolved: someone needs to look at it.
#
# One account failing must not stop the rest: each failure is logged and
# reported to Sentry with ids and the error class only, and the request stays
# pending for the next run.
# @see Readers::AnonymizeAccount
class AccountDeletionSweepJob < ApplicationJob
  # Stands in for the real error in Sentry, which would send its message.
  class Failure < StandardError; end

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
      next false unless request.pending? && request.scheduled_for <= now
      next false unless reader_still_closed?(request, reader)

      Readers::AnonymizeAccount.call(reader, now: now)
      true
    end
  end

  private

  # Reports when it isn't: the request is pending and due, so the reader was
  # changed outside the services.
  def reader_still_closed?(request, reader)
    return true if reader.closed? && !reader.anonymized?

    message = "AccountDeletionSweepJob: pending request #{request.id} skipped, " \
              "reader #{reader.id} closed=#{reader.closed?} anonymized=#{reader.anonymized?}"
    Rails.logger.warn message
    Sentry.capture_message(message) if defined?(Sentry)
    false
  end

  # The class and ids, never the message: a database or validation error can
  # quote column values (a unique violation's DETAIL names the email).
  def report_failure(request, error)
    summary = "request #{request.id} (reader #{request.reader_id}) failed: #{error.class}"
    Rails.logger.error "AccountDeletionSweepJob: #{summary}"
    return unless defined?(Sentry)

    failure = Failure.new(summary)
    failure.set_backtrace(error.backtrace)
    Sentry.capture_exception(
      failure,
      extra: { account_deletion_request_id: request.id, reader_id: request.reader_id }
    )
  end
end
