# frozen_string_literal: true

# @see ReadingList
class ReadingListPolicy < ApplicationPolicy
  def update?
    user.reading_lists.include? record
  end
end
