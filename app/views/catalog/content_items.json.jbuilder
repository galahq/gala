json.key_format! camelize: :lower
json.array! @items do |kase|
  json.extract! kase, *%i(kicker title dek)
  json.cover_url ix_cover_image(kase, :small)
  json.url authentication_strategy_lti_omniauth_callback_url case_slug: kase.slug
end
