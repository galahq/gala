FactoryGirl.define do
  factory :question do
    content { Faker::Lorem.question }
    correct_answer ""
    options []

    trait :multiple_choice do
      options { Faker::Lorem.sentences(4) }
      after :build do |this|
        this.correct_answer = this.options.sample
      end
    end
  end
end
