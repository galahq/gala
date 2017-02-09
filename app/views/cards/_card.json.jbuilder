json.key_format! camelize: :lower
json.extract! card, *%i(id position solid raw_content)
json.content card.content || ""

json.comment_threads card.comment_threads do |comment_thread|
  json.partial! comment_thread
end
