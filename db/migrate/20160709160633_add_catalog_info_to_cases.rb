class AddCatalogInfoToCases < ActiveRecord::Migration[5.0]
  def change
    add_column :cases, :publication_date, :date
    add_column :cases, :catalog_position, :integer, default: 0, null: false
    add_column :cases, :short_title, :text
  end
end
