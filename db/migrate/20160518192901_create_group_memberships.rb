class CreateGroupMemberships < ActiveRecord::Migration[5.0]
  def change
    create_table :group_memberships do |t|
      t.references :reader, foreign_key: true
      t.references :group, foreign_key: true

      t.timestamps
    end
  end
end
