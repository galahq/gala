# frozen_string_literal: true

# Job to sync a Case with Wikidata
# This job can be triggered:
# - When a case is published
# - When a published case is updated
# - On a schedule for periodic updates
class WikidataCaseSyncJob < ApplicationJob
  queue_as :default

  # @param case_id [Integer] the ID of the Case to sync
  def perform(case_id)
    case_obj = Case.find_by(id: case_id)
    return unless case_obj && case_obj.published?

    Rails.logger.info "Syncing Case ##{case_id} to Wikidata"

    # Use the default locale of the case for the sync
    locale = case_obj.locale || 'en'

    begin
      # Create a sync service and perform the sync
      sync_service = Wikidata::SyncService.new(case_obj, locale)
      sync_service.sync!

      Rails.logger.info "Successfully synced Case ##{case_id} to Wikidata"
    rescue StandardError => e
      Rails.logger.error "Error syncing Case ##{case_id} to Wikidata: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")

      # Re-raise the error to trigger job retry mechanism
      raise
    end
  end
end
