# frozen_string_literal: true

json.key_format! camelize: :lower
json.array! @items do |kase|
  json.extract! kase, :slug, :kicker, :title, :dek, :published, :cover_url
  # json.url authentication_strategy_lti_omniauth_callback_url case_slug: kase.slug
end
