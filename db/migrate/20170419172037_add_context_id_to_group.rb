# frozen_string_literal: true

class AddContextIdToGroup < ActiveRecord::Migration[5.0]
  def change
    add_column :groups, :context_id, :string
    add_index :groups, :context_id
  end
end
