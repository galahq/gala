# frozen_string_literal: true

json.key_format! camelize: :lower

json.extract! c, :slug, :published_at, :kicker, :title, :dek, :authors,
              :translators, :acknowledgements, :tags, :photo_credit, :latitude,
              :longitude, :zoom, :featured_at

json.base_cover_url c.cover_url
json.small_cover_url ix_cover_image(c, :small)
json.cover_url ix_cover_image(c, :billboard)

json.library do
  json.cache! c.library do
    json.partial! c.library
  end
end

json.url case_path I18n.locale, c
