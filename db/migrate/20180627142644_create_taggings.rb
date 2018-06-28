# frozen_string_literal: true

class CreateTaggings < ActiveRecord::Migration[5.2]
  def change
    create_table :taggings do |t|
      t.references :case, foreign_key: true
      t.references :tag, foreign_key: true

      t.timestamps
    end

    add_index :taggings, %i[case_id tag_id], unique: true
  end
end
