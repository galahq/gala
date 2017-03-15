class CreateCaseElements < ActiveRecord::Migration[5.0]
  def change
    create_table :case_elements do |t|
      t.references :case, foreign_key: true
      t.references :element, polymorphic: true
      t.integer :position

      t.timestamps
    end
  end
end
