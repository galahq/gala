class CreateLinkedResources < ActiveRecord::Migration[8.1]
  def change
    create_table :linked_resources do |t|
      t.references :record, polymorphic: true, null: false, index: true
      t.string :name, null: false
      t.jsonb :identifiers, null: false, default: []
      t.string :connection, null: false
      t.string :connection_other
      t.text :description
      t.integer :position, null: false, default: 0
      t.timestamps
    end
  end
end
