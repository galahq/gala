json.key_format! camelize: :lower
case notification.category
when "reply_to_thread"
  json.notifier do
    json.(notification.notifier, :id, :name, :initials)
  end
  json.case do
    json.(notification.case, :slug, :kicker )
  end
  json.page do
    json.(notification.page, :id, :position)
  end
end
json.(notification, :id, :data, :message)
