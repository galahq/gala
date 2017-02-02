class AddPositionToComment < ActiveRecord::Migration[5.0]
  def change
    add_column :comments, :position, :integer
  end
end
