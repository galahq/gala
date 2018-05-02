# frozen_string_literal: true

FactoryBot.define do
  factory :case do
    kicker { Faker::Hipster.words(2).join(' ').titlecase }
    title { Faker::Hipster.sentence }
    dek { Faker::Hipster.sentence }
    commentable true

    trait :featured do
      catalog_position :featured
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
        page_count 3
        podcast_count 1
        activity_count 1
      end

      in_catalog

      after :create do |this, ev|
        create_list(:page_element, ev.page_count, case: this)
        create_list(:podcast_element, ev.podcast_count, case: this)
        create_list(:activity_element, ev.activity_count, case: this)
        this.case_elements.reload
      end
    end
  end
end
