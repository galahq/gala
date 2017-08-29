# frozen_string_literal: true

class CreateForums < ActiveRecord::Migration[5.0]
  def change
    create_table :forums do |t|
      t.references :case, foreign_key: true
      t.references :community, foreign_key: true

      t.timestamps
    end

    reversible do |dir|
      dir.up do
        Group.find_each do |g|
          g.create_community name: g.name
          g.deployments.each do |d|
            g.community.forums.create case: d.case
          end
        end
      end
      dir.down {}
    end
  end
end
