# frozen_string_literal: true

# @see Page
class PageSerializer < ApplicationSerializer
  attributes :id, :position, :title, :icon_slug
  attribute(:url) { page_path object }
  attribute(:cards) { object.cards.map(&:to_param) }
  belongs_to :case_element
end
