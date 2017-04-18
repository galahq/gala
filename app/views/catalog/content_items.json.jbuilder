json.key_format! camelize: :lower
json.array! @items do |kase|
  json.extract! kase, *%i(kicker title dek)
  json.cover_url ix_cover_image(kase, :small)
  json.url case_url kase
end
