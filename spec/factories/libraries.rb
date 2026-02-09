# frozen_string_literal: true

FactoryBot.define do
  factory :library do
    sequence(:slug) { |n| "library-#{n}-#{SecureRandom.hex(6)}" }
    sequence(:name) { |n| "Michigan Sustainability Cases #{n}-#{SecureRandom.hex(4)}" }
    background_color { '#00274c' }
    foreground_color { '#ffcb05' }
  end
end
