# frozen_string_literal: true

class AddCoverUrlToCase < ActiveRecord::Migration[5.0]
  def change
    add_column :cases, :cover_url, :string
  end
end
