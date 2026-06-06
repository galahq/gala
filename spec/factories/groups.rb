# frozen_string_literal: true

FactoryBot.define do
  factory :group do
    name { "House #{GalaTestData.house}" }
    context_id { GalaTestData.md5 }
  end
end
