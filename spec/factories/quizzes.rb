# frozen_string_literal: true

FactoryBot.define do
  factory :quiz do
    association :case
    deployments { [] }
    template { nil }
    customized { false }

    after :create do |this|
      create :question, :multiple_choice, quiz: this
      create :question, quiz: this
    end
  end
end
