# frozen_string_literal: true

class CreateLocks < ActiveRecord::Migration[5.2]
  def change
    create_table :locks do |t|
      t.references :lockable, polymorphic: true, index: { unique: true }
      t.references :reader, foreign_key: true
      t.references :case, foreign_key: true

      t.timestamps
    end
  end
end
