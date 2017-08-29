# frozen_string_literal: true

json.key_format! camelize: :lower

json.extract! reply_notification, :id, :message, :card_id, :comment_thread_id
json.community do
  json.extract! reply_notification.comment_thread.forum.community, :id, :name
end
json.notifier do
  json.extract! reply_notification.notifier, :id, :name, :initials
end
json.case do
  json.extract! reply_notification.case, :slug, :kicker
end
json.element do
  json.extract! reply_notification.page.case_element, :position
end
