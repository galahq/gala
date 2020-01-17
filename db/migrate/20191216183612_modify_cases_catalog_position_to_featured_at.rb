class ModifyCasesCatalogPositionToFeaturedAt < ActiveRecord::Migration[6.0]
  def change
    add_column :cases, :featured_at, :timestamp
    reversible do |dir|
      dir.up do
        Case.update_all <<~SQL
          featured_at = CASE catalog_position
                        WHEN 0 THEN NULL
                        WHEN 1 THEN published_at
                        END
          SQL
      end
      dir.down do
        Case.update_all <<~SQL
          catalog_position = CASE featured_at
                             WHEN NULL THEN 0
                             ELSE 1
                             END
          SQL
      end
      remove_column :cases, :catalog_position, :integer, default: 0, null: false
    end
  end
end
