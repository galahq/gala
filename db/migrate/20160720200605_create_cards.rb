class CreateCards < ActiveRecord::Migration[5.0]
  def change
    create_table :cards do |t|
      t.integer :position
      t.hstore :content_i18n
      t.references :page, foreign_key: true

      t.timestamps
    end
  end
end
