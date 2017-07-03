# frozen_string_literal: true

FactoryGirl.define do
  factory :authentication_strategy do
    reader

    trait :google do
      provider 'google'
      uid '123456'
    end
  end
end
