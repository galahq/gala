# frozen_string_literal: true

FactoryBot.define do
  factory :quiz do
    association :case
    title { Faker::Hipster.sentence }
    deployments { [] }
    template { nil }
    customized { false }

    transient do
      multiple_choice_question_count { 1 }
      open_ended_question_count { 1 }
    end

    after :create do |this, ev|
      create_list :question, ev.multiple_choice_question_count,
                  :multiple_choice, quiz: this
      create_list :question, ev.open_ended_question_count,
                  quiz: this
      this.questions.reload
    end
  end
end
