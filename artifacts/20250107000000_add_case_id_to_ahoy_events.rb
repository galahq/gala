class AddCaseIdToAhoyEvents < ActiveRecord::Migration[7.0]
  disable_ddl_transaction!

  def up
    add_column :ahoy_events, :case_id, :integer

    execute <<~SQL
      UPDATE ahoy_events e
      SET case_id = c.id
      FROM cases c
      WHERE e.case_id IS NULL
        AND (e.properties ->> 'case_slug') = c.slug;
    SQL

    add_index :ahoy_events,
              %i[case_id time],
              name: 'idx_ahoy_events_case_id_time',
              algorithm: :concurrently,
              if_not_exists: true
  end

  def down
    remove_index :ahoy_events,
                 name: 'idx_ahoy_events_case_id_time',
                 algorithm: :concurrently,
                 if_exists: true

    remove_column :ahoy_events, :case_id, if_exists: true
  end
end
