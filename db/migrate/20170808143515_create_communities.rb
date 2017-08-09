class CreateCommunities < ActiveRecord::Migration[5.0]
  def change
    create_table :communities do |t|
      t.jsonb :name
      t.references :group, foreign_key: true

      t.timestamps
    end
  end
end
