# frozen_string_literal: true

# :nodoc:
class AddCaselogAttributesToCommunities < ActiveRecord::Migration[5.1]
  def change
    add_column :communities, :description, :jsonb, default: ''
    add_column :communities, :universal, :boolean, default: false
    add_index :communities, :universal
  end
end
