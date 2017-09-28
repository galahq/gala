class AddLocationToCases < ActiveRecord::Migration[5.1]
  def change
    add_column :cases, :latitude, :float
    add_column :cases, :longitude, :float
    add_column :cases, :zoom, :float
  end
end
