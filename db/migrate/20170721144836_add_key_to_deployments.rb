class AddKeyToDeployments < ActiveRecord::Migration[5.0]
  def change
    add_column :deployments, :key, :string
    add_index :deployments, :key, unique: true
  end
end
