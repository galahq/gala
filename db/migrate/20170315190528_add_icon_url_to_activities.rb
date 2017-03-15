class AddIconUrlToActivities < ActiveRecord::Migration[5.0]
  def change
    add_column :activities, :icon_slug, :string
  end
end
