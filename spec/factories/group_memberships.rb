FactoryBot.define do
  factory :group_membership do
    association :group
    association :reader

    trait :admin do
      status { :admin }
    end
  end
end
