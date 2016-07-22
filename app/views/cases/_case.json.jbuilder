json.extract! c, :slug, :published, :title, :case_authors, :summary, :tags, :cover_url
json.translators translators_string c
json.pages c.pages do |page|
  json.id page.id
  json.position page.position
  json.title page.title
  json.cards page.cards do |card|
    json.extract! card, *%i(id position solid content)
  end
end
json.edgenotes do
  json.array! c.edgenotes.map(&:slug)
end
json.podcasts c.podcasts do |podcast|
  json.partial! podcast
end
json.activities c.activities do |activity|
  json.partial! activity
end
