# frozen_string_literal: true

# :nodoc:
class AddDescriptionToCommunities < ActiveRecord::Migration[5.1]
  def change
    add_column :communities, :description, :jsonb, default: ''
  end
end
