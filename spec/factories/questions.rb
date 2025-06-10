# frozen_string_literal: true

FactoryBot.define do
  factory :question do
    association :quiz

    content { { en: Faker::Lorem.question } }
    correct_answer { Faker::Lorem.sentence }
    options { [] }

    trait :multiple_choice do
      options { Faker::Lorem.sentences(number: 4) }
      after :build do |this|
        this.correct_answer = this.options.sample
      end
    end
  end
end
