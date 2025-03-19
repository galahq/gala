# frozen_string_literal: true

# Job to sync a Case with Wikidata
# This job can be triggered:
# - When a case is published
# - When a published case is updated
# - On a schedule for periodic updates
class WikidataCaseSyncJob < ApplicationJob
  queue_as :default

  # @param kase_id [Integer] the ID of the Case to sync
  # @return [String, nil] The Wikidata QID of the synced entity, or nil if sync couldn't be performed
  def perform(kase_id)
    kase = Case.find_by(id: kase_id)
    return nil unless kase && kase.published?

    Rails.logger.info "Syncing Case ##{kase_id} to Wikidata"

    # Use the default locale of the case for the sync
    locale = kase.locale || 'en'

    begin
      # Use our new Client facade to trigger the sync
      client = Wikidata::Client.new(locale)
      qid = client.sync_case(kase)

      Rails.logger.info "Successfully synced Case ##{kase_id} to Wikidata with QID: #{qid}"
      qid
    rescue StandardError => e
      Rails.logger.error "Error syncing Case ##{kase_id} to Wikidata: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")

      # Re-raise the error to trigger job retry mechanism
      raise
    end
  end
end
