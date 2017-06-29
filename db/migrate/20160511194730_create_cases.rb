# frozen_string_literal: true

class CreateCases < ActiveRecord::Migration[5.0]
  def change
    enable_extension 'hstore'
    create_table :cases do |t|
      t.boolean :published, default: false
      t.hstore :title_i18n
      t.text :slug, null: false
      t.string :authors, array: true, default: []
      t.hstore :summary_i18n
      t.text :tags, array: true, default: []
      t.hstore :narrative_i18n

      t.timestamps
    end
    add_index :cases, :slug, unique: true
    add_index :cases, :tags, using: 'gin'
  end
end
