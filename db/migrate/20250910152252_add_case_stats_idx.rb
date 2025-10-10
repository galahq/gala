class AddCaseStatsIdx < ActiveRecord::Migration[7.0]
  disable_ddl_transaction!

  def up
    add_index :ahoy_events,
              ["(properties ->> 'case_slug')", :time],
              name: 'idx_ahoy_events_case_slug_time',
              algorithm: :concurrently,
              if_not_exists: true

    add_index :ahoy_events,
              %i[user_id time],
              name: 'idx_ahoy_events_user_id_time',
              algorithm: :concurrently,
              if_not_exists: true

    add_index :roles,
              :name,
              name: 'idx_roles_name',
              algorithm: :concurrently,
              if_not_exists: true

    add_index :readers_roles,
              :reader_id,
              name: 'idx_readers_roles_reader_id',
              algorithm: :concurrently,
              if_not_exists: true

    add_index :deployments,
              %i[case_id created_at],
              name: 'idx_deployments_case_created_at',
              algorithm: :concurrently,
              if_not_exists: true
  end

  def down
    remove_index :ahoy_events,
                 name: 'idx_ahoy_events_case_slug_time',
                 algorithm: :concurrently,
                 if_exists: true

    remove_index :ahoy_events,
                 name: 'idx_ahoy_events_user_id_time',
                 algorithm: :concurrently,
                 if_exists: true

    remove_index :roles,
                 name: 'idx_roles_name',
                 algorithm: :concurrently,
                 if_exists: true

    remove_index :readers_roles,
                 name: 'idx_readers_roles_reader_id',
                 algorithm: :concurrently,
                 if_exists: true

    remove_index :deployments,
                 name: 'idx_deployments_case_created_at',
                 algorithm: :concurrently,
                 if_exists: true
  end
end
