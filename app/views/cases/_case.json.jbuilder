json.extract! c, :slug, :published, :title, :case_authors, :summary, :tags, :cover_url, :segments
json.podcasts c.podcasts do |pod|
  json.partial! pod
end
