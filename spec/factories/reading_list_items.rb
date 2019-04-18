# frozen_string_literal: true

FactoryBot.define do
  factory :reading_list_item do
    association :case
    association :reading_list

    notes { 'This case is interesting.' }
  end
end
