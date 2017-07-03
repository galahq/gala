# frozen_string_literal: true

FactoryGirl.define do
  factory :activity do
    title { Faker::Hipster.sentence }
  end
end
