FactoryGirl.define do
  factory :case_element do
    association :case

    factory :page_element do
      association :element, factory: :page
    end
    factory :podcast_element do
      association :element, factory: :podcast
    end
    factory :activity_element do
      association :element, factory: :activity
    end
  end
end
