# frozen_string_literal: true

class CreateCaseArchive < ActiveRecord::Migration[6.0]
  def change
    create_table :case_archives do |t|
      t.belongs_to :case, foreign_key: true

      t.timestamps
    end
  end
end
