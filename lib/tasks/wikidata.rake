# frozen_string_literal: true

namespace :wikidata do
  desc 'Sync all published cases with Wikidata'
  task sync_all_cases: :environment do
    puts "Starting sync of all published cases to Wikidata..."

    cases = Case.published
    total = cases.count

    puts "Found #{total} published cases to sync."

    cases.find_each.with_index do |kase, index|
      puts "[#{index + 1}/#{total}] Queueing sync for Case ##{kase.id}: #{kase.title}"
      WikidataCaseSyncJob.perform_later(kase.id)
    end

    puts "All sync jobs have been queued."
  end

  desc 'Sync a specific case with Wikidata by ID'
  task :sync_case, [:kase_id] => :environment do |_, args|
    kase_id = args[:kase_id]

    if kase_id.blank?
      puts "Error: Please provide a case ID. Example: rake wikidata:sync_case[123]"
      next
    end

    kase = Case.find_by(id: kase_id)

    if kase.nil?
      puts "Error: Case with ID #{kase_id} not found."
      next
    end

    if !kase.published?
      puts "Warning: Case ##{kase_id} is not published, but will be synced anyway."
    end

    puts "Queueing sync for Case ##{kase.id}: #{kase.title}"
    WikidataCaseSyncJob.perform_later(kase.id)
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

  desc 'Manual lookup of an entity by QID and schema'
  task :lookup, [:schema, :qid] => :environment do |_, args|
    schema = args[:schema]
    qid = args[:qid]

    if schema.blank? || qid.blank?
      puts "Error: Please provide both schema and QID. Example: rake wikidata:lookup[researchers,Q937]"
      next
    end

    puts "Looking up #{schema} entity with QID #{qid}..."

    begin
      client = Wikidata::Client.new
      data = client.fetch(schema.to_sym, qid)

      if data.nil?
        puts "No data found for #{qid} with schema #{schema}."
        next
      end

      puts "Entity: #{data['entityLabel']}"
      puts "Properties:"

      data['properties'].each do |prop|
        prop.each do |key, value|
          puts "  #{key}: #{value}"
        end
      end

      puts "JSON-LD available: #{data['json_ld'].present?}"
    rescue StandardError => e
      puts "Error looking up entity: #{e.message}"
    end
  end
end
