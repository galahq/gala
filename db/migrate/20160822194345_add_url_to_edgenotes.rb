class AddUrlToEdgenotes < ActiveRecord::Migration[5.0]
  def change
    add_column :edgenotes, :url, :string
    add_column :edgenotes, :instructions_i18n, :hstore
  end
end
