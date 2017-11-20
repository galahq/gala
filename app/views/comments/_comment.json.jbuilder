json.key_format! camelize: :lower
json.(comment, :id, :content, :timestamp, :comment_thread_id)
json.reader do
  json.(comment.reader, :name, :initials, :id, :image_url, :hash_key)
end
