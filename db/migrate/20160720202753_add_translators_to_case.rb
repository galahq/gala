class AddTranslatorsToCase < ActiveRecord::Migration[5.0]
  def change
    add_column :cases, :translators, :text, array: true, default: []
  end
end
