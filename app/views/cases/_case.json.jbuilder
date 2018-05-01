# frozen_string_literal: true

json.key_format! camelize: :lower

json.extract! c,
              :acknowledgements,
              :authors,
              :cover_url,
              :dek,
              :featured_at,
              :kicker,
              :latitude,
              :longitude,
              :photo_credit,
              :published_at,
              :slug,
              :small_cover_url,
              :tags,
              :title,
              :translators,
              :zoom

json.library do
  json.cache! c.library do
    json.partial! c.library
  end
end

json.links do
  json.self case_path I18n.locale, c
  json.settings edit_case_settings_path I18n.locale, c
  json.teach new_deployment_path case_slug: c.slug
end
