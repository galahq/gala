# frozen_string_literal: true

json.key_format! camelize: :lower

json.extract! c, :slug, :published_at, :kicker, :title, :dek, :authors,
              :translators, :summary, :tags, :photo_credit,
              :other_available_locales, :commentable, :learning_objectives,
              :audience, :featured_at

json.authors_string c.authors.to_sentence
json.translators_string translators_string c

json.base_cover_url c.cover_url
json.small_cover_url ix_cover_image(c, :small)
json.cover_url ix_cover_image(c, :billboard)

json.case_elements c.case_elements do |case_element|
  json.cache! case_element do
    json.partial! case_element
  end
end

json.url case_url I18n.locale, c
