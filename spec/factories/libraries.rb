FactoryBot.define do
  factory :library do
    sequence(:slug) { |n| "michigan-sustainaility-cases-#{n}"}
    name "Michigan Sustainability Cases"
    logo_url "https://msc-gala.imgix.net/block-m.svg"
    background_color "#00274c"
    foreground_color "#ffcb05"
  end
end
