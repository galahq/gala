class AddIconSlugToEdgenotes < ActiveRecord::Migration[5.2]
  def change
    add_column :edgenotes, :icon_slug, :text
  end
end
