json.key_format! camelize: :lower
json.partial! @comment_thread
json.card do
  json.partial! @comment_thread.card
end
