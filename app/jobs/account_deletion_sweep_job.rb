# frozen_string_literal: true

# Anonymizes every account whose closure grace period has passed. Enqueued
# daily by `rake accounts:sweep_closures` from Heroku Scheduler (register A10:
# state in Postgres, a scheduled sweep as the trigger).
#
# One account failing must not stop the rest, so each is rescued and logged
# rather than retried as a whole.
# @see Readers::AnonymizeAccount
class AccountDeletionSweepJob < ApplicationJob
  queue_as :default

  def perform(now: Time.current)
    AccountDeletionRequest.due(now).includes(:reader).find_each do |request|
      Readers::AnonymizeAccount.call(request.reader, now: now)
    rescue StandardError => e
      Rails.logger.error <<~MESSAGE
        AccountDeletionSweepJob: request #{request.id} (reader #{request.reader_id}) failed: #{e.class}: #{e.message}
      MESSAGE
    end
  end
end
