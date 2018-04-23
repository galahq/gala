# frozen_string_literal: true

class AddStatusToGroupMemberships < ActiveRecord::Migration[5.2]
  def change
    add_column :group_memberships, :status, :integer, null: false, default: 0

    reversible do |dir|
      dir.up do
        execute <<~SQL
          UPDATE "group_memberships"
          SET "status" = 1
          WHERE "group_memberships"."id" IN (
            SELECT "group_memberships"."id"
            FROM "group_memberships"
            INNER JOIN "readers"
              ON "readers"."id" = "group_memberships"."reader_id"
            INNER JOIN "enrollments"
              ON "enrollments"."reader_id" = "readers"."id"
            WHERE "enrollments"."status" = 1
          );
        SQL
      end
    end
  end
end
