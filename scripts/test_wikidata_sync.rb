#!/usr/bin/env ruby

# Test script for Wikidata synchronization
# Run this from Rails console or as a standalone script

puts '=== Wikidata Sync Test Script ==='
puts 'Using bot authentication with hardcoded credentials'
puts

# Test 1: Authentication
puts '1. Testing authentication...'
begin
  if Wikidata.ensure_logged_in
    puts '✓ Successfully authenticated with Wikidata'
  else
    puts '✗ Failed to authenticate with Wikidata'
    exit 1
  end
rescue StandardError => e
  puts "✗ Authentication error: #{e.message}"
  exit 1
end

# Test 2: Find a published case
puts "\n2. Finding a published case to test..."
test_case = Case.published.first

if test_case
  puts "✓ Found test case: '#{test_case.title}' (ID: #{test_case.id})"
else
  puts '✗ No published cases found for testing'
  exit 1
end

# Test 3: Check if case already has a Wikidata link
puts "\n3. Checking existing Wikidata links..."
existing_link = Wikidata::SyncService.find_existing_wikidata_link(test_case)

if existing_link
  puts "✓ Case already has Wikidata link: #{existing_link.qid}"
  puts "  - Last synced: #{existing_link.last_synced_at}"
  puts '  - Will update existing entity'
else
  puts '✓ No existing Wikidata link found - will create new entity'
end

# Test 4: Test property mapping
puts "\n4. Testing property mapping..."
begin
  properties = Wikidata::SyncService.case_to_wikidata_properties(test_case, test_case.locale || 'en')
  puts "✓ Generated #{properties.keys.count} properties:"
  properties.each do |prop_id, value|
    display_value = value.is_a?(Hash) ? value[:value] : value
    puts "  - #{prop_id}: #{display_value}"
  end
rescue StandardError => e
  puts "✗ Property mapping error: #{e.message}"
  exit 1
end

# Test 5: Sync the case
puts "\n5. Syncing case to Wikidata..."
begin
  qid = Wikidata::SyncService.sync!(test_case, test_case.locale || 'en')

  if qid
    puts '✓ Successfully synced case to Wikidata!'
    puts "  - QID: #{qid}"
    puts "  - Wikidata URL: https://www.wikidata.org/wiki/#{qid}"

    # Check if wikidata_link was created
    updated_link = Wikidata::SyncService.find_existing_wikidata_link(test_case)
    if updated_link
      puts "  - WikidataLink record updated: #{updated_link.id}"
      puts "  - Cached entity label: #{updated_link.entity_label}"
    end
  else
    puts '✗ Sync completed but no QID returned'
  end
rescue StandardError => e
  puts "✗ Sync error: #{e.message}"
  puts "  Backtrace: #{e.backtrace.first(3).join('; ')}"
end

puts "\n=== Test Complete ==="
