# frozen_string_literal: true

FactoryBot.define do
  factory :question do
    association :quiz

    content { { en: GalaTestData.question } }
    correct_answer { GalaTestData.sentence }
    options { [] }

    trait :multiple_choice do
      options { GalaTestData.sentences(number: 4) }
      after :build do |this|
        this.correct_answer = this.options.sample
      end
    end
  end
end
