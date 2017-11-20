# frozen_string_literal: true

json.key_format! camelize: :lower
json.extract! card, :id, :page_id, :position, :solid, :raw_content
json.content card.content || ''
