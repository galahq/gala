FactoryBot.define do
  factory :spotlight_acknowledgement do
    association :reader

    spotlight_key { 'test_dummy' }
  end
end
