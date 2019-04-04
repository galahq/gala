# frozen_string_literal: true

# A single case’s entry in a reading list
#
# @attr notes [String]
# @attr position [Numeric] this case’s sequence within the {ReadingList}
class ReadingListItem < ApplicationRecord
  belongs_to :case
  belongs_to :reading_list

  acts_as_list scope: :reading_list

  def enrolled?(reader)
    reader.enrollment_for_case(self.case)
  end
end
