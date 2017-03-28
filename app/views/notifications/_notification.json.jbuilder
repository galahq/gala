json.key_format! camelize: :lower
case notification.category
when "reply_to_thread"
  json.notifier do
    json.(notification.notifier, :id, :name, :initials)
  end
  json.case do
    json.(notification.case, :slug, :kicker )
  end
  json.element do
    json.(notification.page.case_element, :position)
  end
  json.card_id notification.data[:card_id]
  json.comment_thread_id notification.data[:comment_thread_id]
end
json.(notification, :id, :message)
