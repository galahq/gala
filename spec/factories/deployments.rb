# frozen_string_literal: true

FactoryBot.define do
  factory :deployment do
    association :case
    association :group

    answers_needed { 0 }

    trait :with_quiz do
      answers_needed { 1 }
      transient do
        quiz_multiple_choice_question_count { 1 }
        quiz_open_ended_question_count { 0 }
      end
      after :build do |this, evaluator|
        this.quiz = create :quiz,
                           case: this.case,
                           multiple_choice_question_count:
                             evaluator.quiz_multiple_choice_question_count,
                           open_ended_question_count:
                             evaluator.quiz_open_ended_question_count
      end
    end

    trait :with_pretest do
      with_quiz
      answers_needed { 2 }
      quiz_open_ended_question_count { 1 }
    end
  end
end
