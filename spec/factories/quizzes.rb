# frozen_string_literal: true

FactoryBot.define do
  factory :quiz do
    association :case
    title { Faker::Hipster.sentence }
    deployments { [] }
    template { nil }
    customized { false }

    # Add a trait for skipping validation that can be used in tests
    trait :skip_validation do
      to_create { |instance| instance.save(validate: false) }
    end

    # Use skip_validation by default for factory_bot lint which
    # doesn't care about validations, only data integrity
    factory :quiz_for_lint do
      skip_validation
    end

    # Use this in your normal tests
    factory :quiz_with_questions do
      transient do
        multiple_choice_question_count { 1 }
        open_ended_question_count { 1 }
      end

      after(:create) do |quiz, evaluator|
        create_list(:question, evaluator.multiple_choice_question_count,
                    :multiple_choice, quiz: quiz)
        create_list(:question, evaluator.open_ended_question_count,
                    quiz: quiz)
        quiz.reload
      end
    end
  end
end
