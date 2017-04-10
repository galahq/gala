json.key_format! camelize: :lower
json.cache! [trackable, 'statistics'], expires_in: 1.minute do
  json.(trackable, :views, :uniques, :average_time)
end
