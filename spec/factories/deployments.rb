FactoryGirl.define do
  factory :deployment do
    association :case
    association :group
    association :quiz
  end
end
