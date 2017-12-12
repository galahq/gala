# frozen_string_literal: true

FactoryBot.define do
  factory :podcast do
    title { Faker::Hipster.sentence }
    audio_url 'https://umich.box.com/shared/static/4zbegivj5fm2gwfu0qu0ibxqtpqs3fwi.mp3'
  end
end
