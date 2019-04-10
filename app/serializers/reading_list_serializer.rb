# frozen_string_literal: true

# @see ReadingList
class ReadingListSerializer < ApplicationSerializer
  attributes :title, :description
  attribute :case_slugs

  link(:self) { reading_list_path object }

  def case_slugs
    object.reading_list_items.map(&:case).map(&:slug)
  end
end
