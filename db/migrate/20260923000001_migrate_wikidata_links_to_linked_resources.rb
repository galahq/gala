# Copies every Wikidata link into linked_resources.
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
        COALESCE(NULLIF(cached_json->>'entityLabel', ''), UPPER(TRIM(qid))),
        jsonb_build_array(
          jsonb_build_object('type', 'wikidata', 'value', UPPER(TRIM(qid)))
        ),
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
  end

  # Empties linked_resources so the copy can run again. Any resources authors
  # added since this migration ran are deleted too; wikidata_links is untouched.
  def down
    execute 'DELETE FROM linked_resources'
  end
end
