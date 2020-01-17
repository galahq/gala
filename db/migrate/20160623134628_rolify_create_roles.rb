# frozen_string_literal: true

class RolifyCreateRoles < ActiveRecord::Migration[5.0]
  def change
    create_table(:roles) do |t|
      t.string :name
      t.references :resource, polymorphic: true

      t.timestamps
    end

    create_table(:readers_roles, id: false) do |t|
      t.references :reader
      t.references :role
    end

    add_index(:roles, :name)
    add_index(:roles, %i[name resource_type resource_id])
    add_index(:readers_roles, %i[reader_id role_id])
  end
end
