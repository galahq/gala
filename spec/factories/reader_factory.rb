FactoryGirl.define do
  factory :reader do
    name { Faker::Name.name }
    initials { name.split(" ").map{ |x| x[0] }.join }
    email { Faker::Internet.email }
    password "secret"
    locale "en"

    trait :francophone do
      locale "fr"
    end
  end
end
