class Card < ApplicationRecord
  include Authority::Abilities

  belongs_to :page
  acts_as_list scope: :page

  translates :content

  def case
    page.case
  end

  def views
    events.count
  end

  def uniques
    events.distinct.pluck(:user_id).count
  end

  def average_time
    milliseconds = events.average("(properties ->> 'duration')::int")
    seconds = milliseconds / 1000
    "#{(seconds / 60).floor}:#{(seconds % 60).floor.to_s.rjust 2, '0'}"
  end

  private
  def events
    Ahoy::Event.interesting
      .where(name: 'read_card')
      .where_properties(card_id: id)
  end

end
