# frozen_string_literal: true

# What a Tier 2 erasure removed, counted just before it ran: comments deleted
# and blanked, quiz answers and submissions, reading lists deleted and kept,
# visits and events. Numbers only. Kept with the record of the erasure so the
# admin can quote them in the reply to the person (erasure checklist, step 8)
# and so Gala can show what each erasure did (Art. 5(2)).
class AddErasureCountsToAccountDeletionRequests < ActiveRecord::Migration[8.1]
  def change
    add_column :account_deletion_requests, :erasure_counts, :jsonb
  end
end
