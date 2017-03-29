FactoryGirl.define do
  factory :case do
    sequence(:slug) { |n| "#{Faker::Internet.slug(nil, '-')}#{n}" }
    commentable true

    trait :in_catalog do
      kicker { Faker::Hipster.words(2).join " " }
      title { Faker::Hipster.sentence }
      cover_url "https://lorempixel.com/100/100/"
    end

    trait :featured do
      catalog_position :featured
    end

    trait :published do
      published true
      publication_date { Time.zone.now }
    end

    factory :case_with_elements do
      transient do
        page_count 3
        podcast_count 1
        activity_count 1
      end

      in_catalog

      after :create do |this, ev|
        this.case_elements = create_list(:page_element, ev.page_count) +
          create_list(:podcast_element, ev.podcast_count) +
          create_list(:activity_element, ev.activity_count)

        this.case_elements.includes(:element).map(&:element)
          .each { |e| e.update case: this }
          .each { |e| e.cards.each { |c| c.update case: this } }

        this.pages.includes(:cards).flat_map(&:cards)
          .each { |e| e.update case: this }
      end
    end
  end
end
