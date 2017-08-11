# frozen_string_literal: true

json.key_format! camelize: :lower
json.extract! card, :id, :position, :solid, :raw_content
json.content card.content || ''

if @comment_threads
  json.comment_threads threads_for_card(@comment_threads, card.id) do |comment_thread|
    json.partial! comment_thread
  end
end
