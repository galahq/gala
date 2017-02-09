json.(comment, :id, :content)
json.reader do
  json.(comment.reader, :name, :initials, :id)
end
