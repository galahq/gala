# frozen_string_literal: true

class AddCardToEdgenotes < ActiveRecord::Migration[5.0]
  def change
    add_reference :edgenotes, :card, foreign_key: true
  end
end
