# frozen_string_literal: true

class CreateReadingListItems < ActiveRecord::Migration[6.0]
  def change
    create_table :reading_list_items do |t|
      t.text :notes, null: false, default: ''
      t.integer :position, null: false
      t.references :reading_list, type: :uuid, foreign_key: true
      t.references :case, foreign_key: true

      t.timestamps
    end
  end
end
