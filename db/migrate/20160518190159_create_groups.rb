class CreateGroups < ActiveRecord::Migration[5.0]
  def change
    create_table :groups do |t|
      t.hstore :name_i18n

      t.timestamps
    end
  end
end
