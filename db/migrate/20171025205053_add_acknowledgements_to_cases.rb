class AddAcknowledgementsToCases < ActiveRecord::Migration[5.1]
  def change
    add_column :cases, :acknowledgements, :jsonb
  end
end
