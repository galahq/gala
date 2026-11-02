# frozen_string_literal: true

# A reader's request to close their account: Tier 1 in the compliance
# register. Created the moment they close. The account is hidden from then on,
# and the sweep anonymizes it once +scheduled_for+ passes (A10, A13, A22).
# Signing back in before then restores it, recorded in +restored_at+.
#
# @attr requested_at [DateTime] when the reader closed the account
# @attr scheduled_for [DateTime] when the sweep may anonymize it
# @attr restored_at [DateTime] set if the reader changed their mind in time
# @attr completed_at [DateTime] set when the sweep anonymized the account
# @attr erased_at [DateTime] set when a site admin carried out a full erasure
#   (Tier 2, {Readers::EraseAccount})
# @attr erased_by_id [Integer] the site admin who did it. No foreign key: it
#   records who acted, and should never block removing that admin's row
# @attr erasure_counts [Hash{String => Integer}] what the erasure removed,
#   counted just before it ran (see {Readers::ErasureSummary::COUNTS})
class AccountDeletionRequest < ApplicationRecord
  GRACE_PERIOD = 30.days

  belongs_to :reader, inverse_of: :account_deletion_requests
  belongs_to :erased_by, class_name: 'Reader', optional: true

  validates :requested_at, :scheduled_for, presence: true

  scope :pending, -> { where(restored_at: nil, completed_at: nil) }
  scope :due, ->(at = Time.current) { pending.where(scheduled_for: ..at) }

  def pending?
    restored_at.nil? && completed_at.nil?
  end
end
