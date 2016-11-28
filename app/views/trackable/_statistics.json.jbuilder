if current_user.has_role? :editor
  json.cache! [trackable, 'statistics'], expires_in: 1.minute do
    json.statistics do
      json.(trackable, :views, :uniques, :average_time)
    end
  end
end
