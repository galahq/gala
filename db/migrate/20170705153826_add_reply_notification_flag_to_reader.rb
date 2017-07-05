# frozen_string_literal: true

class AddReplyNotificationFlagToReader < ActiveRecord::Migration[5.0]
  def change
    add_column :readers, :send_reply_notifications, :boolean, default: true
  end
end
