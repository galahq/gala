# frozen_string_literal: true

json.key_format! camelize: :lower
json.extract! card, :id, :position, :solid, :raw_content
json.content card.content || ''

if @comment_threads
  json.comment_threads @comment_threads.where(card: card) do |comment_thread|
    json.partial! comment_thread
  end
end
