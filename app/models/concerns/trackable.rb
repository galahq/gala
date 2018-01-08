# frozen_string_literal: true

# A model of which the usage can be tracked. This module provides methods that
# get summary statistics of reader behavior.
#
# {include:file:docs/trackable_event_schema.md}
module Trackable
  extend ActiveSupport::Concern

  # @abstract Override to set the event name to query for in calculating
  #   summary statistics.
  # @return [String]
  def event_name
    'trackable_event'
  end

  # @abstract Override to set the event properties to filter by in calculating
  #   summary statistics.
  # @return [Hash] in the shape of the including model’s corresponding
  #   {Ahoy::Event#properties} schema
  def event_properties
    {}
  end

  # How many times as this object been viewed?
  # @return [Numeric]
  def views
    events.count
  end

  # How many different readers viewed this object?
  # @return [Numeric]
  def uniques
    events.distinct.pluck(:user_id).count
  end

  # What is the average duration of engagement for this object?
  # @return [String] formatted as 'mm:ss'
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
