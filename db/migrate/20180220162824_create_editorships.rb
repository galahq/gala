# frozen_string_literal: true

class CreateEditorships < ActiveRecord::Migration[5.2]
  def change
    create_table :editorships do |t|
      t.references :case, foreign_key: true
      t.references :editor, foreign_key: { to_table: :readers }
    end
  end
end
