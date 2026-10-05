# frozen_string_literal: true

FactoryBot.define do
  factory :account_deletion_request do
    association :reader
    requested_at { Time.current }
    scheduled_for { requested_at + AccountDeletionRequest::GRACE_PERIOD }

    trait :due do
      requested_at { 31.days.ago }
      scheduled_for { 1.day.ago }
    end
  end
end
