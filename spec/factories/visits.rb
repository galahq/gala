# frozen_string_literal: true

FactoryBot.define do
  factory :visit do
    visit_token { SecureRandom.uuid }
    visitor_token { SecureRandom.uuid }
    started_at { Faker::Time.backward(days: 90) }
    country { %w[US CA GB DE FR IN AU BR JP MX].sample }

    association :user, factory: :reader
  end
end
