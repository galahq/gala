# frozen_string_literal: true

class AddSolidToCards < ActiveRecord::Migration[5.0]
  def change
    add_column :cards, :solid, :boolean, default: :true
  end
end
