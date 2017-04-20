FactoryGirl.define do
  factory :question do
    association :quiz
    answers nil
    content ""
    correct_answer "MyText"
    options []
  end
end
