# frozen_string_literal: true

# @see Activity
class ActivitySerializer < ApplicationSerializer
  attributes :id, :position, :title, :pdf_url, :icon_slug
  attribute(:card_id) { object.card.id }
  attribute(:url) { activity_path I18n.locale, object }

  belongs_to :case_element
end
