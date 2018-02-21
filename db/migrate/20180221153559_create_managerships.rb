# frozen_string_literal: true

class CreateManagerships < ActiveRecord::Migration[5.2]
  def change
    create_table :managerships do |t|
      t.references :library, foreign_key: true
      t.references :manager, foreign_key: { to_table: :readers }

      t.timestamps
    end
  end
end
