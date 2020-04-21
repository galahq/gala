# frozen_string_literal: true

FactoryBot.define do
  factory :case do
    kicker { Faker::Hipster.words(number: 2).join(' ').titlecase }
    title { Faker::Hipster.sentence }
    dek { Faker::Hipster.sentence }
    commentable { true }

    trait :featured do
      catalog_position { :featured }
    end

    trait :published do
      library
      published_at { rand(30).minutes.ago }
      latitude { rand(-70..69) }
      longitude { rand(-180..179) }
      zoom { rand 10 }
    end
    trait :in_catalog do
      published
    end

    factory :case_with_elements do
      transient do
        page_count { 3 }
        podcast_count { 1 }
      end

      in_catalog

      after :create do |this, ev|
        create_list(:page_element, ev.page_count, case: this)
        create_list(:podcast_element, ev.podcast_count, case: this)
        ActivityCreator.for(this)
        this.case_elements.reload
      end

      factory :case_with_edgenotes do
        after :create do |this|
          card = this.pages.first.cards.first
          card.add_edgenote Edgenote.new(website_url: 'https://www.nytimes.com/2018/08/04/world/europe/europe-heat-wave.html'),
                            range: ContentState::Range.new(0, 0, 10)
          card.save
        end
      end
    end
  end
end
