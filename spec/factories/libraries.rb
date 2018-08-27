# frozen_string_literal: true

FactoryBot.define do
  factory :library do
    sequence(:slug) { |n| "michigan-sustainaility-cases-#{n}" }
    name 'Michigan Sustainability Cases'
    background_color '#00274c'
    foreground_color '#ffcb05'
  end
end
