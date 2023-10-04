# frozen_string_literal: true

FactoryBot.define do
  factory :reader do
    name { Faker::Name.name }
    initials { name.split(' ').map { |x| x[0] }.join }
    email { Faker::Internet.email }
    password { 'secret' }
    locale { 'en' }
    confirmed_at { Time.zone.now }
    terms_of_service { 1 }

    trait :francophone do
      locale { 'fr' }
    end

    trait :editor do
      after :build do |this|
        this.add_role :editor
      end
    end

    trait :invisible do
      after :create do |this|
        this.add_role :invisible
      end
    end
  end
end
