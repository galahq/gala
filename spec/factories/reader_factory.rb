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

    trait :editor do
      after :create do |this|
        this.add_role :editor
      end
    end

    trait :invisible do
      after :create do |this|
        this.add_role :invisible
      end
    end
  end
end
