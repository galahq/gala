json.key_format! camelize: :lower
json.url url_for page
json.id page.id
json.position page.position
json.title page.title
json.cards page.cards.map &:id
json.case_element do
  json.partial! page.case_element
end
