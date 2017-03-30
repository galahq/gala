FactoryGirl.define do
  factory :podcast do
    title { Faker::Hipster.sentence }
  end
end
