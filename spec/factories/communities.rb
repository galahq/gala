# frozen_string_literal: true

FactoryBot.define do
  factory :community do
    association :group

    name { "House #{Faker::GameOfThrones.house}" }
  end
end
