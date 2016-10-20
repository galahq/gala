FactoryGirl.define do

#############
# Factories #
#############

  factory :case do
    slug Faker::Internet.slug
    title "Can #{Faker::Hipster.sentence.downcase}?"
    kicker Faker::Hipster.sentence 3
    dek Faker::Hipster.sentence 5, true, 3
    photo_credit Faker::Name.name
    authors { rand(2...5).times.map { Faker::Name.name } }
    summary Faker::Hipster.paragraph
    catalog_position :featured
  end

  factory :reader do
    name Faker::Name.name
    initials { name.split(" ").map{ |x| x[0] }.join }
    email Faker::Internet.email
    password Faker::Internet.password
    locale "en"
  end

end
