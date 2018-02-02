# frozen_string_literal: true

FactoryBot.define do
  factory :activity do
    title { Faker::Hipster.sentence }

    after :build do |this|
      this.case_element ||= build :activity_element, element: this
    end
  end
end
