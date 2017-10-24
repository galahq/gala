class AddAltTextToEdgenotes < ActiveRecord::Migration[5.1]
  def change
    add_column :edgenotes, :alt_text, :string
  end
end
