# frozen_string_literal: true

# The stats panel reads visits.country and nothing else
# (CaseStatsService::Query). Region, city, postal code and coordinates were
# collected on almost every visit and read nowhere, and the local country
# database that now does the lookup cannot return them at all.
#
# This deletes those four values for every visit ever recorded. That is the
# point — it is the data-minimisation half of register item 4 (A5) — but it
# cannot be undone.
class RemoveUnusedGeoFieldsFromVisits < ActiveRecord::Migration[8.1]
  def change
    # visits is written on every page view and read by the stats panel.
    # DROP COLUMN only edits the catalogue, but it needs an ACCESS EXCLUSIVE
    # lock, and a lock *request* queues every later query on the table behind
    # it. Fail fast rather than pile up: the release phase then abandons the
    # release with nothing changed, and the deploy can be retried.
    reversible do |dir|
      dir.up   { execute "SET LOCAL lock_timeout = '5s'" }
      dir.down { execute "SET LOCAL lock_timeout = '5s'" }
    end

    remove_column :visits, :region, :string
    remove_column :visits, :city, :string
    remove_column :visits, :postal_code, :string
    remove_column :visits, :latitude, :decimal
    remove_column :visits, :longitude, :decimal
  end
end
