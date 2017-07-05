# frozen_string_literal: true

class DropNotifications < ActiveRecord::Migration[5.0]
  def change
    drop_table :notifications do |t|
      t.boolean :email_sent
      t.boolean :read
      t.references :reader, foreign_key: true
      t.integer :category
      t.jsonb :data

      t.timestamps
    end
  end
end
