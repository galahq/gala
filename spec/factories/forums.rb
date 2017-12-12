# frozen_string_literal: true

FactoryBot.define do
  factory :forum do
    association :case

    trait :with_community do
      association :community
    end
  end
end
