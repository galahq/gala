class Card < ApplicationRecord
  include Authority::Abilities

  belongs_to :page
  acts_as_list scope: :page

  translates :content

  def case
    page.case
  end
end
