json.extract! c, :slug, :published, :title, :case_authors, :summary, :tags, :cover_url, :segments
json.podcasts c.podcasts do |podcast|
  json.partial! podcast
end
json.activities c.activities do |activity|
  json.partial! activity
end
