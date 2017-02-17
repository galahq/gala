json.key_format! camelize: :lower
json.extract! card, *%i(id position solid raw_content)
json.content card.content || ""

json.comment_threads card.comment_threads.select { |x| x.visible_to_reader? current_reader } do |comment_thread|
  json.partial! comment_thread
end
