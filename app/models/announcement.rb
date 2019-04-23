# frozen_string_literal: true

# An alert that the administrators would like the users to see.
#
# @attr content [String]
# @attr url [String]
# @attr visible_logged_out [Boolean]
# @attr deactivated_at [TimeWithZone]
class Announcement < ApplicationRecord
  time_for_a_boolean :deactivated

  scope :active, -> do
    where 'deactivated_at IS NULL OR deactivated_at > ?', Time.zone.now
  end
  scope :deactivated, -> { where 'deactivated_at <= ?', Time.zone.now }
  scope :visible_logged_out, -> { where visible_logged_out: true }

  def self.for_user(user)
    return active.visible_logged_out unless user.persisted?

    return active if user.seen_announcements_created_before.nil?

    active.where 'created_at > ?', user.seen_announcements_created_before
  end
end
