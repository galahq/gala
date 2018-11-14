# frozen_string_literal: true

FactoryBot.define do
  factory :deployment do
    association :case
    association :group

    answers_needed { 0 }

    trait :with_quiz do
      answers_needed { 1 }
      after :build do |this|
        this.quiz = create :quiz, case: this.case
      end
    end

    trait :with_pretest do
      with_quiz
      answers_needed { 2 }
    end
  end
end
