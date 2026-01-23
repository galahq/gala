# frozen_string_literal: true

FactoryBot.define do
  factory :ahoy_event, class: 'Ahoy::Event' do
    association :visit
    association :user, factory: :reader
    name { %w[visit_case visit_page visit_podcast].sample }
    time { visit&.started_at || Time.current }

    transient do
      case_slug { nil }
    end

    after(:build) do |event, evaluator|
      event.properties = { 'case_slug' => evaluator.case_slug }
    end
  end
end
