class Card < ApplicationRecord
  include Authority::Abilities

  belongs_to :page
  acts_as_list scope: :page

  translates :content

  include Trackable
  def event_name
    'read_card'
  end

  def event_properties
    { card_id: id }
  end

  def case
    page.case
  end

end
