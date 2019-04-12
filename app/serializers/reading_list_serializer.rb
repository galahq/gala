# frozen_string_literal: true

# @see ReadingList
class ReadingListSerializer < ApplicationSerializer
  attributes :title, :description, :case_slugs

  link(:self) { reading_list_path object }
end
