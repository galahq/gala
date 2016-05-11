class CreateCases < ActiveRecord::Migration[5.0]
  def change
    create_table :cases do |t|
      t.boolean :published, default: false
      t.text :title
      t.text :slug, null: false
      t.string :authors
      t.text :summary
      t.text :tags, array: true, default: []

      t.timestamps
    end
    add_index :cases, :slug, unique: true
    add_index :cases, :tags, using: 'gin'
  end
end
