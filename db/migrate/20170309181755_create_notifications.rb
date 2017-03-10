class CreateNotifications < ActiveRecord::Migration[5.0]
  def change
    create_table :notifications do |t|
      t.boolean :email_sent
      t.boolean :read
      t.references :reader, foreign_key: true
      t.integer :category
      t.jsonb :data

      t.timestamps
    end
  end
end
