FactoryGirl.define do
  factory :page do
    transient do
      card_count 3
    end

    title { Faker::Hipster.sentence }

    after :create do |this, ev|
      this.cards = create_list :card, ev.card_count
    end
  end
end
