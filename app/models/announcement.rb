# frozen_string_literal: true

# An alert that the administrators would like the users to see.
#
# @attr content [String]
# @attr url [String]
# @attr visible_logged_out [Boolean]
# @attr deactivated_at [TimeWithZone]
class Announcement < ApplicationRecord
  time_for_a_boolean :deactivated

  scope :deactivated, -> { where 'deactivated_at <= ?', Time.zone.now }
  scope :active, -> do
    where 'deactivated_at IS NULL OR deactivated_at > ?', Time.zone.now
  end

  def self.for_reader(reader)
    return active if reader.seen_announcements_created_before.nil?

    active.where 'created_at > ?', reader.seen_announcements_created_before
  end
end
