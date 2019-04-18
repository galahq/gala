# frozen_string_literal: true

# An instance of a {Reader} having saved a {ReadingList}.
class ReadingListSave < ApplicationRecord
  belongs_to :reader
  belongs_to :reading_list
end
