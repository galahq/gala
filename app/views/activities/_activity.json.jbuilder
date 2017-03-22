json.key_format! camelize: :lower
json.extract! activity, :id, :position, :title, :pdf_url, :icon_slug
json.card_id activity.card.id
json.case_element do
  json.partial! activity.case_element
end
