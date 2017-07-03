# frozen_string_literal: true

class AddIndicesToAhoyEvents < ActiveRecord::Migration[5.0]
  def change
    add_index :ahoy_events, 'properties jsonb_path_ops', using: 'gin'
  end
end
