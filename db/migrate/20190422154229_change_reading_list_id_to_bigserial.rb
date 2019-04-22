class ChangeReadingListIdToBigserial < ActiveRecord::Migration[6.0]
  def change
    remove_foreign_key :reading_list_items, :reading_lists
    remove_index :reading_list_items, column: :reading_list_id, using: :btree

    remove_foreign_key :reading_list_saves, :reading_lists
    remove_index :reading_list_saves, column: :reading_list_id, using: :btree
    remove_index :reading_list_saves, column: [:reader_id, :reading_list_id],
                 unique: true


    rename_column :reading_lists, :id, :uuid
    add_column :reading_lists, :id, :bigserial, null: false

    add_index :reading_lists, :uuid, unique: true

    rename_column :reading_list_items, :reading_list_id, :reading_list_uuid
    add_column :reading_list_items, :reading_list_id, :bigint

    rename_column :reading_list_saves, :reading_list_id, :reading_list_uuid
    add_column :reading_list_saves, :reading_list_id, :bigint

    reversible do |dir|
      dir.up do
        execute <<~SQL
        UPDATE reading_list_items
           SET reading_list_id = reading_lists.id
          FROM reading_lists
         WHERE reading_list_items.reading_list_uuid = reading_lists.uuid;

        UPDATE reading_list_saves
           SET reading_list_id = reading_lists.id
          FROM reading_lists
         WHERE reading_list_saves.reading_list_uuid = reading_lists.uuid;

        ALTER TABLE reading_lists DROP CONSTRAINT reading_lists_pkey;
        ALTER TABLE reading_lists
              ADD CONSTRAINT reading_lists_pkey PRIMARY KEY (id);
        SQL
      end

      dir.down do
        execute <<~SQL
        UPDATE reading_list_items
           SET reading_list_uuid = reading_lists.uuid
          FROM reading_lists
         WHERE reading_list_items.reading_list_id = reading_lists.id;

        UPDATE reading_list_saves
           SET reading_list_uuid = reading_lists.uuid
          FROM reading_lists
         WHERE reading_list_saves.reading_list_id = reading_lists.id;

        ALTER TABLE reading_lists DROP CONSTRAINT reading_lists_pkey;
        ALTER TABLE reading_lists
              ADD CONSTRAINT reading_lists_pkey PRIMARY KEY (uuid);
        SQL
      end
    end

    remove_column :reading_list_items, :reading_list_uuid, :uuid
    remove_column :reading_list_saves, :reading_list_uuid, :uuid

    add_foreign_key :reading_list_items, :reading_lists
    add_index :reading_list_items, :reading_list_id, using: :btree

    add_foreign_key :reading_list_saves, :reading_lists
    add_index :reading_list_saves, :reading_list_id, using: :btree
    add_index :reading_list_saves, [:reader_id, :reading_list_id], unique: true
  end
end
