# frozen_string_literal: true

FactoryGirl.define do
  factory :quiz do
    association :case
    deployments []
    template nil
    customized false

    after :create do |this|
      this.questions.create attributes_for(:question, :multiple_choice, quiz_id: this.id)
      this.questions.create attributes_for(:question, quiz_id: this.id)
    end
  end
end
