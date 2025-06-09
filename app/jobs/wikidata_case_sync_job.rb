# frozen_string_literal: true

# Job to sync a Case with Wikidata
# This job can be triggered:
# - When a case is published
# - When a published case is updated
# - On a schedule for periodic updates
class WikidataCaseSyncJob < ApplicationJob
  queue_as :default

  # @param kase_id [Integer] the ID of the Case to sync
  # @param dry_run [Boolean] If true, only logs what would be done without making changes (default: true)
  # @return [String, nil] The Wikidata QID of the synced entity, or nil if sync couldn't be performed
  def perform(kase_id, dry_run: true)
    kase = Case.find_by(id: kase_id)
    return nil unless kase && kase.published?

    if dry_run
      Rails.logger.info "DRY RUN: Syncing Case ##{kase_id} to Wikidata"
    else
      Rails.logger.info "Syncing Case ##{kase_id} to Wikidata"
    end

    # Use the default locale of the case for the sync
    locale = kase.locale || 'en'

    begin
      # Use the new sync service to trigger the sync
      qid = Wikidata::SyncService.sync!(kase, locale, nil, dry_run: dry_run)

      if qid.present?
        if dry_run
          Rails.logger.info "DRY RUN: Would have synced Case ##{kase_id} to Wikidata with QID: #{qid}"
        else
          Rails.logger.info "Successfully synced Case ##{kase_id} to Wikidata with QID: #{qid}"
        end
        qid
      else
        if dry_run
          Rails.logger.warn "DRY RUN: Sync completed but no QID would be returned for Case ##{kase_id}"
        else
          Rails.logger.warn "Sync completed but no QID returned for Case ##{kase_id}"
        end
        nil
      end
    rescue StandardError => e
      Rails.logger.error "Error syncing Case ##{kase_id} to Wikidata: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")

      # Re-raise the error to trigger job retry mechanism unless it's a dry run
      raise unless dry_run
    end
  end
end
