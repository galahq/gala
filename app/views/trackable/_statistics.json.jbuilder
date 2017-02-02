if current_user.has_cached_role? :editor
  json.cache! [trackable, 'statistics'], expires_in: 10.minute do
    json.(trackable, :views, :uniques, :average_time)
  end
end
