# frozen_string_literal: true

class AddSeenAnnouncementsCreatedBeforeToReader < ActiveRecord::Migration[6.0]
  def change
    add_column :readers, :seen_announcements_created_before, :timestamp
  end
end
