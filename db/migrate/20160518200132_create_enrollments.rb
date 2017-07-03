# frozen_string_literal: true

class CreateEnrollments < ActiveRecord::Migration[5.0]
  def change
    create_table :enrollments do |t|
      t.references :reader, foreign_key: true
      t.references :case, foreign_key: true

      t.timestamps
    end
  end
end
