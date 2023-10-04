# frozen_string_literal: true

FactoryBot.define do
  factory :lock do
    association :lockable, factory: :case
    association :reader
    created_at { Time.now }
    updated_at { Time.now }

    trait :one_hour_old do
      created_at { 1.hour.ago }
    end

    trait :eight_hours_old do
      created_at { 8.hours.ago }
    end
  end
end