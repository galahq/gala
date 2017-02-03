json.key_format! camelize: :lower
json.extract! card, *%i(id position solid raw_content)
json.content card.content || ""

json.comment_threads card.comment_threads do |thread|
  json.(thread, *%i(id block_index start length original_highlight_text))
end
