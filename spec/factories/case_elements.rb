# frozen_string_literal: true

FactoryBot.define do
  factory :page_element, class: CaseElement do
    association :case

    after :build do |this|
      this.element ||= create :page_with_cards, case_element: this
    end
  end

  factory :podcast_element, class: CaseElement do
    association :case

    after :build do |this|
      this.element ||= create :podcast, case_element: this
    end
  end
end
