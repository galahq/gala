# frozen_string_literal: true

# A single case’s entry in a reading list
#
# @attr notes [String]
# @attr position [Numeric] this case’s sequence within the {ReadingList}
class ReadingListItem < ApplicationRecord
  default_scope -> { order :position }

  attribute :case_slug, type: :string

  belongs_to :case
  belongs_to :reading_list

  after_find :initialize_case_slug
  before_validation :set_case_from_slug, if: :case_slug_changed?

  acts_as_list scope: :reading_list

  def enrolled?(reader)
    reader.enrollment_for_case(self.case)
  end

  private

  def initialize_case_slug
    self.case_slug = self.case&.slug
  end

  def set_case_from_slug
    self.case = Case.friendly.find(case_slug)
  end
end
