# frozen_string_literal: true

FactoryBot.define do
  factory :community do
    association :group

    name { "House #{Faker::TvShows::GameOfThrones.house}" }
  end
end
