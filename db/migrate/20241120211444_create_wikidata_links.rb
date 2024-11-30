class CreateWikidataLinks < ActiveRecord::Migration[6.0]
  def change
    create_table :wikidata_links do |t|
      t.references :record, polymorphic: true, null: false, index: true
      t.string :qid, null: false
      t.string :schema, null: false
      t.integer :position, null: false, default: 0
      t.jsonb :cached_json, default: {}
      t.datetime :last_synced_at
      t.timestamps
    end
  end
end
