# frozen_string_literal: true

class AddSlugToEdgenote < ActiveRecord::Migration[5.0]
  def change
    add_column :edgenotes, :slug, :text, null: false
    add_index :edgenotes, :slug, unique: true
  end
end
