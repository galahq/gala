class CreateInvitations < ActiveRecord::Migration[5.0]
  def change
    create_table :invitations do |t|
      t.references :reader, foreign_key: true
      t.references :community, foreign_key: true
      t.integer :inviter_id
      t.timestamp :accepted_at
      t.timestamp :rescinded_at

      t.timestamps
    end
  end
end
