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
  COLUMNS = {
    region: :string,
    city: :string,
    postal_code: :string,
    latitude: :decimal,
    longitude: :decimal
  }.freeze

  def up
    fail_fast_rather_than_queue
    COLUMNS.each_key { |name| remove_column :visits, name }
  end

  def down
    fail_fast_rather_than_queue
    COLUMNS.each { |name, type| add_column :visits, name, type }
  end

  private

  # visits is written on every page view and read by the stats panel. ALTER
  # TABLE only edits the catalogue, but the ACCESS EXCLUSIVE lock *request*
  # queues every later query on the table behind it. Fail fast instead: the
  # release phase abandons the release with nothing changed, and the deploy
  # can be retried.
  #
  # up and down are explicit rather than a reversible block inside change,
  # because reverting a change replays its commands in reverse — which put
  # this statement after the ALTERs, where it did nothing.
  def fail_fast_rather_than_queue
    execute "SET LOCAL lock_timeout = '5s'"
  end
end
