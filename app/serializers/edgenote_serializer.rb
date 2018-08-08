# frozen_string_literal: true

# @see Edgenote
class EdgenoteSerializer < ApplicationSerializer
  attributes :slug, :caption, :format, :thumbnail_url, :content, :website_url,
             :embed_code, :instructions, :image_url, :image_thumbnail_url,
             :pdf_url, :photo_credit, :style, :pull_quote, :attribution,
             :call_to_action, :audio_url, :alt_text, :updated_at, :highlighted

  link(:self) { edgenote_path object }
  link(:audio) { edgenote_attachment_path object, :audio }
  link(:image) { edgenote_attachment_path object, :image }
end
