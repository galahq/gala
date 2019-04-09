# frozen_string_literal: true

# @see ReadingList
class ReadingListSerializer < ApplicationSerializer
  attributes :title, :description
  attribute :case_slugs

  def case_slugs
    object.cases.pluck(:slug)
  end
end
