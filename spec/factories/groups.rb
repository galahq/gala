# frozen_string_literal: true

FactoryGirl.define do
  factory :group do
    name { "House #{Faker::GameOfThrones.house}" }
    context_id { Faker::Crypto.md5 }

    after(:create, &:create_community)
  end
end
