class AddVisibleInCatalogToLibraries < ActiveRecord::Migration[5.2]
  def change
    add_column :libraries, :visible_in_catalog_at, :timestamp
    add_index :libraries, :visible_in_catalog_at
  end
end
