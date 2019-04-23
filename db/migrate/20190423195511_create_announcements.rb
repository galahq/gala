class CreateAnnouncements < ActiveRecord::Migration[6.0]
  def change
    create_table :announcements do |t|
      t.text :content
      t.string :url
      t.boolean :visible_logged_out
      t.timestamp :deactivated_at

      t.timestamps
    end
  end
end
