# frozen_string_literal: true

# Tier 1 account closure (compliance register A10, A13, A22).
#
# `readers.closed_at` is the cheap flag presentation reads: from the moment it
# is set, everyone else sees "Deleted user". `readers.anonymized_at` records
# the day-30 scrub. `account_deletion_requests` is the audit trail and the
# sweep's queue; a reader has at most one pending request at a time.
class AddAccountClosure < ActiveRecord::Migration[8.1]
  def change # rubocop:disable Metrics/MethodLength
    add_column :readers, :closed_at, :datetime
    add_column :readers, :anonymized_at, :datetime
    add_index :readers, :closed_at

    create_table :account_deletion_requests do |t|
      t.references :reader, null: false, foreign_key: true
      t.datetime :requested_at, null: false
      t.datetime :scheduled_for, null: false
      t.datetime :restored_at
      t.datetime :completed_at

      t.timestamps
    end

    add_index :account_deletion_requests, :reader_id,
              unique: true,
              where: 'restored_at IS NULL AND completed_at IS NULL',
              name: 'index_account_deletion_requests_pending_per_reader'
    add_index :account_deletion_requests, :scheduled_for
  end
end
