# frozen_string_literal: true

FactoryBot.define do
  factory :reading_list do
    association :reader

    title { 'New Reading List' }
    description { 'This reading list is for interesting cases.' }
  end
end
