json.extract! card, *%i(id position solid)
json.content card.content || ""

if current_reader.has_role? :invisible
  json.(card, :views, :uniques, :average_time)
end
