# frozen_string_literal: true

# @see Edgenote
class EdgenoteSerializer < ApplicationSerializer
  attributes :alt_text, :attribution, :audio_url, :call_to_action, :embed_code,
             :file_url, :layout, :icon_slug, :image_thumbnail_url,
             :image_url, :instructions, :pdf_url, :photo_credit, :pull_quote,
             :style, :updated_at, :caption, :content, :format, :slug,
             :thumbnail_url, :website_url

  link(:self) { edgenote_path object }
  link(:audio) { edgenote_attachment_path object, :audio }
  link(:image) { edgenote_attachment_path object, :image }
  link(:file) { edgenote_attachment_path object, :file }
end
