# frozen_string_literal: true

class AddDescriptionAndUrlToLibraries < ActiveRecord::Migration[5.1]
  def change
    add_column :libraries, :description, :jsonb
    add_column :libraries, :url, :jsonb

    add_column :libraries, :name_jsonb, :jsonb
    reversible do |dir|
      dir.up do
        Library.update_all %(name_jsonb = ('{"en": "'||name||'"}')::jsonb)
      end
      dir.down do
        Library.update_all "name = name_jsonb->>'en'"
      end
    end
    rename_column :libraries, :name, :name_string
    rename_column :libraries, :name_jsonb, :name
    remove_column :libraries, :name_string, :string
  end
end
