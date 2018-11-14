# frozen_string_literal: true

FactoryBot.define do
  factory :page do
    title { Faker::Hipster.sentence }

    after :build do |this|
      this.case_element ||= build :page_element, element: this
    end

    factory :page_with_cards do
      transient do
        card_count { 5 }
      end

      after :create do |this, ev|
        create_list(:card, ev.card_count, element: this)
        this.cards.reload
      end
    end
  end
end
