# frozen_string_literal: true

# A collection of cases put together by a reader so she can share them together.
#
# @attr title [String]
# @attr description [String]
class ReadingList < ApplicationRecord
  belongs_to :reader

  has_many :reading_list_items, dependent: :destroy
  has_many :cases, through: :reading_list_items

  validates :title, presence: true

  alias items reading_list_items
end
