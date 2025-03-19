# frozen_string_literal: true

namespace :wikidata do
  desc 'Sync all published cases with Wikidata'
  task sync_all_cases: :environment do
    puts "Starting sync of all published cases to Wikidata..."

    cases = Case.published
    total = cases.count

    puts "Found #{total} published cases to sync."

    # Create a report array to track results
    results = {
      success: 0,
      failure: 0,
      skipped: 0,
      details: []
    }

    cases.find_each.with_index do |kase, index|
      puts "[#{index + 1}/#{total}] Syncing Case ##{kase.id}: #{kase.title}"

      begin
        qid = WikidataCaseSyncJob.perform_now(kase.id)
        if qid
          puts "  ✓ Successfully synced to Wikidata entity: #{qid}"

          if qid.start_with?('Q') && !qid.include?('-')
            puts "  Entity URL: https://www.wikidata.org/wiki/#{qid}"
          end

          results[:success] += 1
          results[:details] << { id: kase.id, title: kase.title, status: 'success', qid: qid }
        else
          puts "  ✗ Sync failed - no QID returned."
          results[:failure] += 1
          results[:details] << { id: kase.id, title: kase.title, status: 'failure', error: 'No QID returned' }
        end
      rescue StandardError => e
        puts "  ✗ Error syncing Case ##{kase.id}: #{e.message}"
        results[:failure] += 1
        results[:details] << { id: kase.id, title: kase.title, status: 'failure', error: e.message }
      end
    end

    puts "\nSync completed."
    puts "Success: #{results[:success]}"
    puts "Failure: #{results[:failure]}"
    puts "Skipped: #{results[:skipped]}"

    # Save a report file
    report_file = Rails.root.join('log', "wikidata_sync_#{Time.now.strftime('%Y%m%d_%H%M%S')}.json")
    File.write(report_file, results.to_json)
    puts "Detailed report saved to: #{report_file}"
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

    puts "Syncing Case ##{kase.id}: #{kase.title}..."

    begin
      qid = WikidataCaseSyncJob.perform_now(kase.id)
      if qid
        puts "✓ Successfully synced Case ##{kase.id} to Wikidata"
        puts "  Entity ID: #{qid}"

        # If this is a real Wikidata QID (starts with Q and no hyphens)
        if qid.start_with?('Q') && !qid.include?('-')
          puts "  Wikidata URL: https://www.wikidata.org/wiki/#{qid}"
        else
          puts "  Note: This is a local identifier used for development/testing."
        end

        # Check if a self link was created
        self_link = WikidataLink.find_self_link(kase.id)
        if self_link
          puts "  Self link created with ID: #{self_link.id}"
        end
      else
        puts "✗ Sync failed - no QID returned."
      end
    rescue StandardError => e
      puts "✗ Error syncing Case ##{kase.id}: #{e.message}"
      puts e.backtrace.first(5).join("\n  ")
    end
  end

  desc 'Refresh cached Wikidata information for all links'
  task refresh_cached_wikidata: :environment do
    puts "Refreshing cached Wikidata information..."

    # Get both regular case links and self links
    case_links = WikidataLink.where(record_type: 'Case')
    self_links = WikidataLink.where(record_type: 'self')

    all_links = case_links + self_links
    total = all_links.count

    puts "Found #{case_links.count} case links and #{self_links.count} self links to refresh (#{total} total)."

    # Track success/failures
    success = 0
    failure = 0

    all_links.each_with_index do |link, index|
      link_type = link.self_link? ? "self" : link.record_type
      entity_type = link.real_wikidata_entity? ? "Wikidata" : "local"
      puts "[#{index + 1}/#{total}] Refreshing data for #{link_type} #{entity_type} link ##{link.id} (#{link.qid})"
      begin
        if link.fetch_and_update_data!
          puts "  ✓ Successfully refreshed data."
          success += 1
        else
          puts "  ✗ Failed to refresh data."
          failure += 1
        end
      rescue StandardError => e
        puts "  ✗ Error refreshing data: #{e.message}"
        failure += 1
      end
    end

    puts "\nRefresh completed."
    puts "Success: #{success}"
    puts "Failure: #{failure}"
  end

  desc 'Refresh only stale Wikidata links (older than 1 day)'
  task refresh_stale: :environment do
    puts "Refreshing stale Wikidata links (not updated in the last 24 hours)..."

    stale_links = WikidataLink.stale
    total = stale_links.count

    puts "Found #{total} stale links to refresh."

    if total > 0
      refreshed = WikidataLink.refresh_stale!
      puts "Successfully refreshed #{refreshed} out of #{total} links."
    else
      puts "No stale links found."
    end
  end

  desc 'List all self-type Wikidata links'
  task list_self_links: :environment do
    puts "Listing all self-type Wikidata links..."

    self_links = WikidataLink.where(record_type: 'self')
    total = self_links.count

    puts "Found #{total} self links."

    if total > 0
      # Count real vs local entities
      real_entities = self_links.real_entities.count
      local_entities = self_links.local_entities.count

      puts "Real Wikidata entities: #{real_entities}"
      puts "Local development entities: #{local_entities}"
      puts

      puts "ID\tQID\t\tRecord ID\tSchema\t\tLast Synced\t\tEntity Label"
      puts "-" * 100

      self_links.each do |link|
        entity_type = link.real_wikidata_entity? ? "[WIKIDATA]" : "[LOCAL]"
        puts "#{link.id}\t#{link.qid}\t#{link.record_id}\t\t#{link.schema}\t#{link.last_synced_at&.strftime('%Y-%m-%d %H:%M')}\t#{entity_type} #{link.entity_label}"
      end

      puts "\nNote: Local entities are for development/testing only."
      puts "Real Wikidata entities can be viewed at https://www.wikidata.org/wiki/[QID]"
    else
      puts "No self links found."
    end
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
      client = Wikidata::ApiClient.new
      entity_data = client.get_entity(qid)

      if entity_data.nil?
        puts "No data found for #{qid} with schema #{schema}."
        next
      end

      puts "Entity: #{entity_data.dig('labels', 'en', 'value') || qid}"

      if entity_data['descriptions'] && entity_data['descriptions']['en']
        puts "Description: #{entity_data['descriptions']['en']['value']}"
      end

      puts "\nProperties:"
      if entity_data['claims'].present?
        entity_data['claims'].each do |property_id, statements|
          if statements.present? && statements.first.present?
            statement = statements.first
            if statement['mainsnak'] && statement['mainsnak']['datavalue']
              value = extract_value_from_statement(statement['mainsnak'])
              puts "  #{property_id}: #{value}"
            end
          end
        end
      else
        puts "  No properties found."
      end

      # Check if this entity exists as a self link
      self_link = WikidataLink.where(qid: qid, record_type: 'self').first
      if self_link
        puts "\nThis entity is linked to record_id: #{self_link.record_id} as a self link."

        if self_link.record_type == 'self' && self_link.record_id
          kase = Case.find_by(id: self_link.record_id)
          if kase
            puts "Case: #{kase.title} (#{kase.id})"
          end
        end
      end

      puts "\nWikidata URL: https://www.wikidata.org/wiki/#{qid}" if qid.start_with?('Q') && !qid.include?('-')
    rescue StandardError => e
      puts "Error looking up entity: #{e.message}"
      puts e.backtrace.first(5).join("\n  ")
    end
  end

  # Helper method to extract value from a statement
  def extract_value_from_statement(mainsnak)
    return "No value" unless mainsnak['datavalue']

    datavalue = mainsnak['datavalue']
    case datavalue['type']
    when 'wikibase-entityid'
      entity_id = datavalue.dig('value', 'id')
      "#{entity_id} (https://www.wikidata.org/wiki/#{entity_id})"
    when 'time'
      datavalue.dig('value', 'time')
    when 'string'
      datavalue['value']
    when 'monolingualtext'
      "#{datavalue.dig('value', 'text')} (#{datavalue.dig('value', 'language')})"
    else
      datavalue['value'].to_s
    end
  end

  desc "Authenticate with Wikidata in the background using client credentials"
  task authenticate: :environment do
    puts "Attempting to authenticate with Wikidata using client credentials..."

    token_manager = Wikidata::TokenManager.new
    token = token_manager.get_token_with_client_credentials

    if token
      puts "✅ Successfully authenticated with Wikidata"
      puts "Access token stored in Redis"

      # Test the token with a simple API call
      client = Wikidata::Client.new(token)
      entity = client.get_entity('Q42') # Douglas Adams

      if entity
        puts "✅ Successfully fetched test entity: #{entity.dig('labels', 'en', 'value')}"
      else
        puts "❌ Failed to fetch test entity"
      end
    else
      puts "❌ Failed to authenticate with Wikidata"
      puts "Make sure your client_id and client_secret are configured correctly in the environment."
    end
  end

  desc "Test the current Wikidata authentication"
  task test: :environment do
    puts "Testing current Wikidata authentication..."

    client = Wikidata::Client.new
    entity = client.get_entity('Q42') # Douglas Adams

    if entity
      puts "✅ Successfully authenticated and fetched test entity: #{entity.dig('labels', 'en', 'value')}"
    else
      puts "❌ Authentication test failed - could not fetch test entity"
      puts "Try running 'rake wikidata:authenticate' first"
    end
  end

  desc "Clear all stored Wikidata tokens"
  task clear_tokens: :environment do
    puts "Clearing all stored Wikidata tokens..."

    token_manager = Wikidata::TokenManager.new
    token_manager.clear_tokens

    puts "✅ All tokens cleared from Redis"
  end

  # New tasks for Sidekiq job testing

  desc "Queue the Wikidata authentication job in Sidekiq"
  task queue_auth_job: :environment do
    puts "Queueing WikidataAuthenticationJob in Sidekiq..."
    job_id = WikidataAuthenticationJob.perform_later.job_id
    puts "✅ Job queued with ID: #{job_id}"
    puts "Check Sidekiq dashboard or logs for results"
  end

  desc "Queue the refresh stale Wikidata links job in Sidekiq"
  task queue_refresh_job: :environment do
    puts "Queueing RefreshStaleWikidataLinksJob in Sidekiq..."
    job_id = RefreshStaleWikidataLinksJob.perform_later.job_id
    puts "✅ Job queued with ID: #{job_id}"
    puts "Check Sidekiq dashboard or logs for results"
  end
end
