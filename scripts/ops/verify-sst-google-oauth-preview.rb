#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"

GOOGLE_KEYS = %w[
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  GOOGLE_MIGRATION_CLIENT_ID
  GOOGLE_MIGRATION_CLIENT_SECRET
].freeze
TASKS = %w[
  GalaWebTask
  GalaWorkerTask
  GalaMigrateTask
  GalaSeedDatabaseTask
  GalaRefreshIndicesTask
  GalaWeeklyReportTask
].freeze
SERVICES = %w[GalaWebService GalaWorkerService].freeze
STANDALONE_LINK_REFS = %w[
  GalaMigrateLinkRef
  GalaSeedDatabaseLinkRef
  GalaRefreshIndicesLinkRef
  GalaWeeklyReportLinkRef
].freeze
READ_ONLY_OPS = %w[read read-replacement same].freeze
TASK_REPLACEMENT_OPS = %w[create-replacement replace delete-replaced].freeze
ROUTE_CREATE_OPS = %w[create create-replacement].freeze
ROUTE_DELETE_OPS = %w[delete delete-replaced].freeze

def logical_name(event)
  event.fetch("urn").split("::").last
end

def require_condition(message)
  raise message unless yield
end

def parse_containers(event, side)
  value = event.fetch(side).fetch("inputs").fetch("containerDefinitions")
  value.is_a?(String) ? JSON.parse(value) : value
end

def keyed_entries(entries, field)
  result = entries.to_h { |entry| [entry.fetch(field), entry] }
  require_condition("duplicate #{field} entries in task container input") { result.length == entries.length }
  result
end

def verify_container_change!(event, old_host, new_host)
  old_containers = parse_containers(event, "old")
  new_containers = parse_containers(event, "new")
  require_condition("task container count changed") { old_containers.length == new_containers.length }

  old_by_name = keyed_entries(old_containers, "name")
  new_by_name = keyed_entries(new_containers, "name")
  require_condition("task container names changed") { old_by_name.keys.sort == new_by_name.keys.sort }

  old_by_name.each do |container_name, old_container|
    new_container = new_by_name.fetch(container_name)
    old_secrets = old_container.fetch("secrets", [])
    new_secrets = new_container.fetch("secrets", [])
    old_google = old_secrets.select { |secret| GOOGLE_KEYS.include?(secret.fetch("name")) }
    new_google = new_secrets.select { |secret| GOOGLE_KEYS.include?(secret.fetch("name")) }
    expected_google = GOOGLE_KEYS.map do |key|
      { "name" => key, "valueFrom" => "/gala/dev/#{key}" }
    end

    require_condition("Google secrets already existed in old task input") { old_google.empty? }
    require_condition("new task input does not contain the exact four deterministic Google parameters") do
      new_google.sort_by { |secret| secret.fetch("name") } ==
        expected_google.sort_by { |secret| secret.fetch("name") }
    end
    require_condition("non-Google task secrets changed") do
      old_secrets == new_secrets.reject { |secret| GOOGLE_KEYS.include?(secret.fetch("name")) }
    end

    old_environment = keyed_entries(old_container.fetch("environment", []), "name")
    new_environment = keyed_entries(new_container.fetch("environment", []), "name")
    require_condition("task environment keys changed outside the approved preview metadata") do
      old_environment.keys.sort == new_environment.keys.sort
    end
    require_condition("BASE_URL did not perform the approved preview turnover") do
      old_environment.fetch("BASE_URL").fetch("value") == "https://#{old_host}" &&
        new_environment.fetch("BASE_URL").fetch("value") == "https://#{new_host}"
    end
    require_condition("GALA_PREVIEW_PR_NUMBER did not perform the approved preview turnover") do
      old_environment.fetch("GALA_PREVIEW_PR_NUMBER").fetch("value") == old_host.split(".").first.delete_prefix("pr-") &&
        new_environment.fetch("GALA_PREVIEW_PR_NUMBER").fetch("value") == new_host.split(".").first.delete_prefix("pr-")
    end

    normalized_old = Marshal.load(Marshal.dump(old_container))
    normalized_new = Marshal.load(Marshal.dump(new_container))
    normalized_new["secrets"] = new_secrets.reject { |secret| GOOGLE_KEYS.include?(secret.fetch("name")) }
    %w[BASE_URL GALA_PREVIEW_PR_NUMBER].each do |key|
      normalized_new.fetch("environment").find { |entry| entry.fetch("name") == key }["value"] =
        old_environment.fetch(key).fetch("value")
    end
    require_condition("task container input changed outside Google secrets and preview metadata") do
      normalized_old == normalized_new
    end
  end
end

def take_exact!(events, type:, name:, op:)
  indexes = events.each_index.select do |index|
    event = events[index]
    event.fetch("type") == type && logical_name(event) == name && event.fetch("op") == op
  end
  require_condition("expected exactly one #{op} #{type} #{name}") { indexes.length == 1 }
  events.delete_at(indexes.first)
end

def verify!(events, old_host, new_host)
  require_condition("diff JSON must be an array") { events.is_a?(Array) }
  mutable = events.reject { |event| READ_ONLY_OPS.include?(event.fetch("op")) }

  GOOGLE_KEYS.each do |key|
    take_exact!(mutable, type: "sst:sst:Secret", name: key, op: "create")
    take_exact!(mutable, type: "sst:sst:LinkRef", name: "#{key}LinkRef", op: "create")
    take_exact!(mutable, type: "aws:ssm/parameter:Parameter", name: "#{key}Parameter", op: "create")
  end

  TASKS.each do |name|
    TASK_REPLACEMENT_OPS.each do |operation|
      event = take_exact!(
        mutable,
        type: "aws:ecs/taskDefinition:TaskDefinition",
        name: name,
        op: operation,
      )
      next if operation == "delete-replaced"

      require_condition("#{name} changed outside containerDefinitions") do
        event.fetch("diffs", []).sort == ["containerDefinitions"]
      end
      verify_container_change!(event, old_host, new_host) if operation == "create-replacement"
    end
  end

  SERVICES.each do |name|
    event = take_exact!(mutable, type: "aws:ecs/service:Service", name: name, op: "update")
    require_condition("#{name} changed outside its task-definition pointer") do
      event.fetch("diffs", []).sort == ["taskDefinition"]
    end
  end

  STANDALONE_LINK_REFS.each do |name|
    matches = mutable.select do |event|
      event.fetch("type") == "sst:sst:LinkRef" && logical_name(event) == name && event.fetch("op") == "update"
    end
    require_condition("missing expected secret metadata update for #{name}") { !matches.empty? }
    matches.each do |event|
      require_condition("#{name} LinkRef changed outside secret metadata") do
        (event.fetch("diffs", []) - %w[include properties]).empty?
      end
      mutable.delete(event)
    end
  end

  old_marker = old_host.split(".").first
  new_marker = new_host.split(".").first
  route_events = mutable.select { |event| event.fetch("urn").include?("GalaAppRouterRoute") }
  require_condition("preview route turnover must create at least one new route resource") do
    route_events.any? { |event| ROUTE_CREATE_OPS.include?(event.fetch("op")) }
  end
  require_condition("preview route turnover must delete at least one old route resource") do
    route_events.any? { |event| ROUTE_DELETE_OPS.include?(event.fetch("op")) }
  end
  route_events.each do |event|
    operation = event.fetch("op")
    if ROUTE_CREATE_OPS.include?(operation)
      require_condition("created route does not belong to the intended preview host") do
        event.fetch("urn").include?(new_marker)
      end
    elsif ROUTE_DELETE_OPS.include?(operation)
      require_condition("deleted route does not belong to the prior preview host") do
        event.fetch("urn").include?(old_marker)
      end
    else
      raise "unapproved preview route operation"
    end
    mutable.delete(event)
  end

  return if mutable.empty?

  event = mutable.first
  raise "unapproved preview operation: #{event.fetch("op")} #{event.fetch("type")} #{logical_name(event)}"
end

begin
  raise "usage: #{$PROGRAM_NAME} DIFF_JSON OLD_PREVIEW_HOST NEW_PREVIEW_HOST" unless ARGV.length == 3

  events = JSON.parse(File.binread(ARGV[0]))
  verify!(events, ARGV[1], ARGV[2])
  puts "PASS approved SST Google OAuth preview"
  puts "Google creates: 12; task revisions: 6; service pointers: 2; preview route turnover: approved"
rescue JSON::ParserError
  warn "refusing preview: diff is not valid JSON"
  exit 1
rescue KeyError, RuntimeError => error
  warn "refusing preview: #{error.message}"
  exit 1
end
