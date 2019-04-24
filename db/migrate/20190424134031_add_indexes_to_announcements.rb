# frozen_string_literal: true

class AddIndexesToAnnouncements < ActiveRecord::Migration[6.0]
  def change
    add_index :announcements, :created_at
    add_index :announcements, :deactivated_at
  end
end
