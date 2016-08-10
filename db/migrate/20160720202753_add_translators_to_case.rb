class AddTranslatorsToCase < ActiveRecord::Migration[5.0]
  def change
    add_column :cases, :translators, :hstore, default: '', null: false
  end
end
