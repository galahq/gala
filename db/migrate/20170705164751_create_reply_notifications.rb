# frozen_string_literal: true

class CreateReplyNotifications < ActiveRecord::Migration[5.0]
  def change
    create_table :reply_notifications do |t|
      t.references :reader

      t.integer :notifier_id
      t.integer :comment_thread_id
      t.integer :case_id
      t.integer :page_id
      t.integer :card_id
    end
  end
end
