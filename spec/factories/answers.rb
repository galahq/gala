# frozen_string_literal: true

FactoryBot.define do
  factory :answer do
    association :question
    association :quiz
    association :reader
    association :submission

    content { 'MyString' }
    correct { false }
  end
end
