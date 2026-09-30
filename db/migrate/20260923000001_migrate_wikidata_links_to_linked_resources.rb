# Moves every Wikidata link into linked_resources, then drops wikidata_links.
# The old schema becomes the connection: grants → grant, works → publication,
# anything else → other, labeled with the old category name.
class MigrateWikidataLinksToLinkedResources < ActiveRecord::Migration[8.1]
  def up
    execute <<~SQL
      INSERT INTO linked_resources
        (record_type, record_id, name, identifiers, connection,
         connection_other, position, created_at, updated_at)
      SELECT
        record_type,
        record_id,
        COALESCE(NULLIF(cached_json->>'entityLabel', ''), UPPER(qid)),
        jsonb_build_array(jsonb_build_object('type', 'wikidata', 'value', UPPER(qid))),
        CASE schema
          WHEN 'grants' THEN 'grant'
          WHEN 'works' THEN 'publication'
          ELSE 'other'
        END,
        CASE
          WHEN schema IN ('grants', 'works') THEN NULL
          ELSE INITCAP(schema)
        END,
        position,
        created_at,
        updated_at
      FROM wikidata_links
    SQL

    drop_table :wikidata_links
  end

  def down
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
