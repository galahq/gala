class CreateForums < ActiveRecord::Migration[5.0]
  def change
    create_table :forums do |t|
      t.references :case, foreign_key: true
      t.references :community, foreign_key: true

      t.timestamps
    end
  end
end
