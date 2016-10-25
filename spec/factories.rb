FactoryGirl.define do

#############
# Factories #
#############

  factory :case do
    transient do
      pages_count { rand(4...7) }
    end

    sequence(:slug) { |n| "#{Faker::Internet.slug(nil, '-')}#{n}" }
    title { "#{%w(Can Does Will).sample} #{Faker::Hipster.sentence.downcase.chop}?" }
    kicker { Faker::Hipster.sentence(3, true, 1).chop }
    dek { Faker::Hipster.sentence 5, true, 3 }
    photo_credit { Faker::Name.name }
    authors { rand(2...5).times.map { Faker::Name.name } }
    summary { Faker::Hipster.paragraph 7, true }

    trait :featured do
      catalog_position :featured
    end

    trait :published do
      published true
      publication_date { Time.zone.now }
    end

    after :create do |kase, evaluator|
      create_list :page, evaluator.pages_count, case: kase
    end
  end


  factory :card do
    transient do
      edgenotes_count { rand(1...2) }
    end

    page
    content { rand(1...2).times.map { "<p>#{Faker::Hipster.paragraph}</p>" }.join }

    after :create do |card, evaluator|
      edgenote = create :edgenote, case: card.page.case
      card.update content: "#{card.content}<p><a data-edgenote=\"#{edgenote.slug}\">Edgenote</a></p>"
    end
  end


  factory :edgenote do
    association :case

    sequence(:slug) { |n| "#{Faker::Internet.slug(nil, '-')}#{n}" }
    caption { Faker::Hipster.sentence }
    thumbnail_url { Faker::Placeholdit.image }
    photo_credit { Faker::Name.name }
    format :aside
    content { rand(1...3).times.map { "<p>#{Faker::Hipster.paragraph}</p>" }.join }
    instructions { Faker::Hipster.sentences }

    trait :graphic do
      format :graphic
      image_url { Faker::Placeholdit.image "700x700" }
    end

    trait :link do
      format :link
      image_url { Faker::Placeholdit.image "700x700" }
      website_url { Faker::Internet.url }
    end

    trait :pdf do
      format :report
      pdf_url "https://www.dropbox.com/s/98j607ngkfnrv4j/criteria.pdf?dl=1"
    end

    trait :video do
      format :video
      embed_code '<iframe width="560" height="315" src="https://www.youtube.com/embed/ZvGbcKXZBLg" frameborder="0" allowfullscreen></iframe>'
    end
  end


  factory :enrollment do
    association :case
    reader

    trait :as_instructor do
      status :instructor
    end
  end


  factory :page do
    transient do
      cards_count { rand(1...9) }
    end

    association :case
    title { Faker::Hipster.sentence(2, true, 3).chop }

    after :create do |page, evaluator|
      create_list :card, evaluator.cards_count, page: page
    end
  end


  factory :reader do
    name { Faker::Name.name }
    initials { name.split(" ").map{ |x| x[0] }.join }
    email { Faker::Internet.email }
    password "secret"
    locale "en"
  end

end
