# frozen_string_literal: true

FactoryGirl.define do
  factory :quiz do
    association :case
    deployments []
    template nil
    customized false

    after :create do |this|
      create :question, :multiple_choice, quiz_id: this.id
      create :question, quiz_id: this.id
    end
  end
end
