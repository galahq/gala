# frozen_string_literal: true

FactoryGirl.define do
  factory :community do
    name { "House #{Faker::GameOfThrones.house}" }
    group nil
  end
end
