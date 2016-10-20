FactoryGirl.define do

#############
# Factories #
#############

  factory :case do
    transient do
      pages_count { rand(4...7) }
    end

    slug { Faker::Internet.slug(nil, '-') }
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
    page
    content { rand(1...3).times.map { "<p>#{Faker::Hipster.paragraph}</p>" }.join }
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
