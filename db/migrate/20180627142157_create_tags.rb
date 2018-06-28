# frozen_string_literal: true

class CreateTags < ActiveRecord::Migration[5.2]
  class Tag < ApplicationRecord
  end

  def change
    create_table :tags do |t|
      t.boolean :category, null: false, default: false
      t.string :name, null: false
      t.jsonb :display_name
      t.integer :taggings_count, null: false, default: 0

      t.timestamps
    end

    add_index :tags, :name, unique: true

    reversible do |dir|
      dir.up do
        Tag.create name: 'climate', display_name: { en: 'climate' },
                   category: true
        Tag.create name: 'energy', display_name: { en: 'energy' },
                   category: true
        Tag.create name: 'food', display_name: { en: 'food' },
                   category: true
        Tag.create name: 'health', display_name: { en: 'health' },
                   category: true
        Tag.create name: 'land', display_name: { en: 'land' },
                   category: true
        Tag.create name: 'lifeforms', display_name: { en: 'lifeforms' },
                   category: true
        Tag.create name: 'materials', display_name: { en: 'materials' },
                   category: true
        Tag.create name: 'water', display_name: { en: 'water' },
                   category: true
      end
    end
  end
end
