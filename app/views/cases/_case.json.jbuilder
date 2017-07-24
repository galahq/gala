# frozen_string_literal: true

json.key_format! camelize: :lower

json.extract! c, :slug, :published, :kicker, :title, :dek, :case_authors,
              :summary, :tags, :photo_credit, :other_available_locales,
              :commentable, :learning_objectives, :audience

json.base_cover_url c.cover_url
json.small_cover_url ix_cover_image(c, :small)
json.cover_url ix_cover_image(c, :billboard)
json.translators translators_string c

json.page_ids c.pages.map(&:id)
json.case_elements c.case_elements do |case_element|
  json.partial! case_element
end

by_id json,
      pages: c.pages,
      cards: c.cards,
      edgenotes: c.edgenotes,
      podcasts: c.podcasts,
      activities: c.activities
