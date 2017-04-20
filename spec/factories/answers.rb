FactoryGirl.define do
  factory :answer do
    association :question
    association :quiz
    association :reader
    content "MyString"
    correct false
  end
end
