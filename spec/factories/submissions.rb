# frozen_string_literal: true

FactoryBot.define do
  factory :submission do
    association :quiz
    association :reader
  end
end
