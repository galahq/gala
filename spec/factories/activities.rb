# frozen_string_literal: true

FactoryBot.define do
  factory :activity do
    title { Faker::Hipster.sentence }
  end
end
