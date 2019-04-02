# frozen_string_literal: true

class CreateReadingLists < ActiveRecord::Migration[6.0]
  def change
    create_table :reading_lists, id: :uuid do |t|
      t.string :title, null: false, default: ''
      t.text :description, null: false, default: ''
      t.references :reader, foreign_key: true

      t.timestamps
    end
  end
end
