# frozen_string_literal: true

class AddHighlightedToEdgenotes < ActiveRecord::Migration[5.2]
  def change
    add_column :edgenotes, :highlighted, :boolean, default: false
  end
end
