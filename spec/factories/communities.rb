# frozen_string_literal: true

FactoryBot.define do
  factory :community do
    name { "House #{Faker::GameOfThrones.house}" }
    group nil
  end
end
