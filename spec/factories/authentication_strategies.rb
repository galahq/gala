# frozen_string_literal: true

FactoryBot.define do
  factory :authentication_strategy do
    reader

    trait :google do
      provider 'google'
      uid '123456'
    end
  end
end
