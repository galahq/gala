# frozen_string_literal: true

# Tier 2 full erasure (compliance register A14; Tier 2 erasure checklist).
#
# The deletion request stays as the record that an erasure was carried out
# (Art. 5(2)): when, and which site admin did it. `erased_by_id` has no
# foreign key on purpose: it records who acted. Closing or scrubbing that
# admin's own account keeps their row, so a key could only ever matter if
# the row were deleted outright, and this record shouldn't block that.
class AddErasureToAccountDeletionRequests < ActiveRecord::Migration[8.1]
  def change
    add_column :account_deletion_requests, :erased_at, :datetime
    add_column :account_deletion_requests, :erased_by_id, :bigint
  end
end
