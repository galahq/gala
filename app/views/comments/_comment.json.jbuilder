json.(comment, :id, :content, :timestamp)
json.reader do
  json.(comment.reader, :name, :initials, :id)
end
