# frozen_string_literal: true

FactoryBot.define do
  factory :comment_thread do
    association :forum, :with_community
    association :reader
  end
end
