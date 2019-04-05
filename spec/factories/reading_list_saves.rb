FactoryBot.define do
  factory :reading_list_save do
    association :reader
    association :reading_list
  end
end
