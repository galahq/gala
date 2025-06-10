# frozen_string_literal: true

# Job to sync WikidataLinks with case overview fields
# This job can be triggered:
# - When a case's overview fields are updated
# - On a schedule for periodic updates
class WikidataLinkSyncJob < ApplicationJob
  queue_as :default

  # @param wikidata_link_id [Integer] the ID of the WikidataLink to sync
  # @return [Boolean] true if sync was successful, false otherwise
  def perform(wikidata_link_id)
    wikidata_link = WikidataLink.find_by(id: wikidata_link_id)
    return false unless wikidata_link

    Rails.logger.info "Syncing WikidataLink ##{wikidata_link_id} with case overview fields"

    begin
      # Only sync links that belong to cases
      if wikidata_link.record_type == 'Case' && wikidata_link.record.present?
        sync_case_overview_fields(wikidata_link)
      elsif wikidata_link.record_type == 'self' && wikidata_link.record_id.present?
        kase = Case.find_by(id: wikidata_link.record_id)
        sync_case_overview_fields(wikidata_link, kase) if kase
      end

      true
    rescue StandardError => e
      Rails.logger.error "Error syncing WikidataLink ##{wikidata_link_id}: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")

      # Re-raise the error to trigger job retry mechanism
      raise
    end
  end

  private

  def sync_case_overview_fields(wikidata_link, kase = nil)
    kase ||= wikidata_link.record
    locale = kase.locale || 'en'

    # Ensure we have a valid session
    Wikidata.ensure_logged_in

    # Map case overview fields to Wikidata properties
    properties = Wikidata::SyncService.case_to_wikidata_properties(kase, locale)

    # Add claims to the Wikidata entity
    success = Wikidata.add_claims(wikidata_link.qid, properties)

    if success
      # Fetch updated entity data for caching
      entity_data = Wikidata.get_entity(wikidata_link.qid, locale)
      json_ld = Wikidata.generate_json_ld(entity_data, locale)

      # Update the cached information
      cache_data = {
        'entityLabel' => kase.title,
        'properties' => Wikidata::SyncService.format_properties_for_cache(properties),
        'json_ld' => json_ld
      }

      # Update the wikidata_link with new cached data
      wikidata_link.update!(
        cached_json: cache_data,
        last_synced_at: Time.current
      )

      Rails.logger.info "Successfully synced WikidataLink ##{wikidata_link.id} with case overview fields"
    else
      Rails.logger.error "Failed to add properties to Wikidata entity #{wikidata_link.qid}"
      raise StandardError, "Failed to add properties to Wikidata entity #{wikidata_link.qid}"
    end
  end
end
