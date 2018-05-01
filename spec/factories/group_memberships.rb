FactoryBot.define do
  factory :group_membership do
    association :group
    association :reader
  end
end
