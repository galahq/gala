# frozen_string_literal: true

json.key_format! camelize: :lower
json.extract! edgenote, :slug, :caption, :format, :thumbnail_url, :content,
              :website_url, :embed_code, :instructions, :image_url,
              :image_thumbnail_url, :pdf_url, :photo_credit, :style,
              :pull_quote, :attribution, :call_to_action, :audio_url,
              :youtube_slug, :alt_text
json.links do
  json.self edgenote_path edgenote
  json.audio edgenote_attachment_path edgenote, :audio
  json.image edgenote_attachment_path edgenote, :image
end
