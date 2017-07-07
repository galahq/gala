class AddMetadataToCases < ActiveRecord::Migration[5.0]
  def change
    add_column :cases, :learning_objectives, :jsonb
    add_column :cases, :audience, :jsonb
    add_column :cases, :classroom_timeline, :jsonb
  end
end
