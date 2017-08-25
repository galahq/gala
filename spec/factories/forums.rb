# frozen_string_literal: true

FactoryGirl.define do
  factory :forum do
    association :case
    association :community
  end
end
