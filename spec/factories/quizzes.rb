# frozen_string_literal: true

FactoryBot.define do
  factory :quiz do
    association :case, factory: :case_with_elements
    association :author, factory: :reader

    title { 'After Reading' }

    transient do
      customized { false }
      multiple_choice_question_count { 1 }
      open_ended_question_count { 0 }
    end

    # By default, use save_without_validation! to bypass validation
    to_create do |instance|
      instance.save_without_validation!
    end

    after :create do |this, ev|
      create_list :question, ev.multiple_choice_question_count,
                  :multiple_choice, quiz: this
      create_list :question, ev.open_ended_question_count,
                  quiz: this
      this.custom_questions.reload
    end

    trait :suggested do
      author_id { nil }
      lti_uid { nil }
    end

    trait :lti do
      author_id { nil }
    end
  end
end
