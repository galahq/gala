# frozen_string_literal: true

class CreateReadingListSaves < ActiveRecord::Migration[6.0]
  def change
    create_table :reading_list_saves do |t|
      t.references :reader, foreign_key: true
      t.references :reading_list, foreign_key: true, type: :uuid

      t.timestamps
    end

    add_index :reading_list_saves, %i[reader_id reading_list_id], unique: true
  end
end
