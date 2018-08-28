# frozen_string_literal: true

class AddCasesCountToLibraries < ActiveRecord::Migration[5.2]
  def change
    add_column :libraries, :cases_count, :integer, default: 0
    reversible { |dir| dir.up { data } }
  end

  def data
    execute <<~SQL.squish
      UPDATE libraries
         SET cases_count = (
           SELECT count(1)
             FROM cases
            WHERE cases.library_id = libraries.id
      )
    SQL
  end
end
