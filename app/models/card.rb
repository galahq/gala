class Card < ApplicationRecord
  belongs_to :page
  acts_as_list scope: :page

  translates :content

  def case
    page.case
  end
end
