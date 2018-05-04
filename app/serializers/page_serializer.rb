# frozen_string_literal: true

# @see Page
class PageSerializer < ApplicationSerializer
  attributes :id, :position, :title
  attribute(:url) { page_path I18n.locale, object }
  attribute(:cards) { object.cards.map(&:id) }
  belongs_to :case_element
end
