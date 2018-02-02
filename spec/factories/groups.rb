# frozen_string_literal: true

FactoryBot.define do
  factory :group do
    name { "House #{Faker::GameOfThrones.house}" }
    context_id { Faker::Crypto.md5 }
  end
end
