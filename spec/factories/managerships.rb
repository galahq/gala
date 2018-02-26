# frozen_string_literal: true

FactoryBot.define do
  factory :managership do
    association :library
    association :manager, factory: :reader
  end
end
