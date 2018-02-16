# frozen_string_literal: true

FactoryBot.define do
  factory :comment do
    association :reader
    association :comment_thread

    content { Faker::Hipster.sentence }
  end
end
