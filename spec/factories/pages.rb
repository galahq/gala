# frozen_string_literal: true

FactoryBot.define do
  factory :page do
    transient do
      card_count 5
    end

    title { Faker::Hipster.sentence }

    after :create do |this, ev|
      ev.card_count.times do
        this.cards << create(:card)
      end
    end
  end
end
