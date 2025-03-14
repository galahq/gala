# frozen_string_literal: true

namespace :wikidata do
  desc 'Sync all published cases with Wikidata'
  task sync_all_cases: :environment do
    puts "Starting sync of all published cases to Wikidata..."

    cases = Case.published
    total = cases.count

    puts "Found #{total} published cases to sync."

    cases.find_each.with_index do |case_obj, index|
      puts "[#{index + 1}/#{total}] Queueing sync for Case ##{case_obj.id}: #{case_obj.title}"
      WikidataCaseSyncJob.perform_later(case_obj.id)
    end

    puts "All sync jobs have been queued."
  end

  desc 'Sync a specific case with Wikidata by ID'
  task :sync_case, [:case_id] => :environment do |_, args|
    case_id = args[:case_id]

    if case_id.blank?
      puts "Error: Please provide a case ID. Example: rake wikidata:sync_case[123]"
      next
    end

    case_obj = Case.find_by(id: case_id)

    if case_obj.nil?
      puts "Error: Case with ID #{case_id} not found."
      next
    end

    if !case_obj.published?
      puts "Warning: Case ##{case_id} is not published, but will be synced anyway."
    end

    puts "Queueing sync for Case ##{case_obj.id}: #{case_obj.title}"
    WikidataCaseSyncJob.perform_later(case_obj.id)
    puts "Sync job has been queued."
  end

  desc 'Refresh cached Wikidata information for all cases'
  task refresh_cached_wikidata: :environment do
    puts "Refreshing cached Wikidata information..."

    links = WikidataLink.where(record_type: 'Case')
    total = links.count

    puts "Found #{total} Wikidata links to refresh."

    links.find_each.with_index do |link, index|
      puts "[#{index + 1}/#{total}] Refreshing data for Wikidata link ##{link.id} (#{link.qid})"
      begin
        link.fetch_and_update_data!
        puts "  ✓ Successfully refreshed data."
      rescue StandardError => e
        puts "  ✗ Error refreshing data: #{e.message}"
      end
    end

    puts "All Wikidata link data has been refreshed."
  end
end
