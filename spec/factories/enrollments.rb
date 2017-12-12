# frozen_string_literal: true

FactoryBot.define do
  factory :enrollment do
    association :case, factory: :case_with_elements
    association :reader

    status :student

    trait :as_instructor do
      status :instructor
    end
  end
end
