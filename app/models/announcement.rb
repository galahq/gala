# frozen_string_literal: true

# An alert that the administrators would like the users to see.
#
# @attr content [String]
# @attr url [String]
# @attr visible_logged_out [Boolean]
# @attr deactivated_at [TimeWithZone]
class Announcement < ApplicationRecord
  time_for_a_boolean :deactivated
end
