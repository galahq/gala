# frozen_string_literal: true

module Trackable
  extend ActiveSupport::Concern

  # >> TRACKABLE PROTOCOL >>
  #
  # event_name -> String
  # Set the event name to query for
  def event_name
    'trackable_event'
  end

  # event_properties -> Hash
  # Set the event properties to filter by.
  def event_properties
    {}
  end
  # << TRACKABLE PROTOCOL <<

  def views
    events.count
  end

  def uniques
    events.distinct.pluck(:user_id).count
  end

  def average_time
    milliseconds = events.average("(properties ->> 'duration')::int") || 0
    seconds = milliseconds / 1000
    "#{(seconds / 60).floor}:#{(seconds % 60).floor.to_s.rjust 2, '0'}"
  end

  private

  def events
    Ahoy::Event.interesting
               .where(name: event_name)
               .where_properties(event_properties)
  end
end
