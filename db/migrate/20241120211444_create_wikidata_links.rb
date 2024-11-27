class CreateWikidataLinks < ActiveRecord::Migration[6.0]
  def change
    create_table :wikidata_links do |t|
      t.references :object, polymorphic: true, null: false, index: true
      t.references :case, null: false, index: true
      t.string :schema, null: false
      t.string :qid, null: false
      t.integer :position, null: false, default: 0
      t.timestamps
    end
  end
end
