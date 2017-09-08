# frozen_string_literal: true

json.key_format! camelize: :lower

@cases.each do |kase|
  json.set! kase.slug do
    json.extract! kase, :slug, :published_at, :kicker, :title, :dek, :authors,
                  :translators, :summary, :tags, :photo_credit
    json.authors_string kase.authors.to_sentence
    json.translators_string translators_string kase
    json.base_cover_url kase.cover_url
    json.small_cover_url ix_cover_image(kase, :square)
    json.cover_url ix_cover_image(kase, :billboard)
  end
end
