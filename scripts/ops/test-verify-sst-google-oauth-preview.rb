#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "open3"
require "tmpdir"

ROOT = File.expand_path("../..", __dir__)
VERIFIER = File.join(ROOT, "scripts/ops/verify-sst-google-oauth-preview.rb")
OLD_HOST = "pr-787.dev.learngala.dev"
NEW_HOST = "pr-790.dev.learngala.dev"
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
FORBIDDEN_TYPES = %w[
  aws:s3/bucket:Bucket
  aws:ses/domainIdentity:DomainIdentity
  aws:lb/loadBalancer:LoadBalancer
  aws:cloudfront/distribution:Distribution
  aws:cloudwatch/logGroup:LogGroup
  aws:appautoscaling/target:Target
  aws:ec2/instance:Instance
  aws:rds/instance:Instance
  aws:elasticache/replicationGroup:ReplicationGroup
].freeze

def urn(type, name, parent = nil)
  qualified_type = parent ? "#{parent}$#{type}" : type
  "urn:pulumi:dev::gala::#{qualified_type}::#{name}"
end

def container_definitions(host, pr_number, google: false)
  secrets = [{ "name" => "DATABASE_URL", "valueFrom" => "/gala/dev/DATABASE_URL" }]
  if google
    GOOGLE_KEYS.each do |key|
      secrets << { "name" => key, "valueFrom" => "/gala/dev/#{key}" }
    end
  end

  JSON.generate(
    [
      {
        "name" => "app",
        "image" => "353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:deployed",
        "environment" => [
          { "name" => "BASE_URL", "value" => "https://#{host}" },
          { "name" => "GALA_PREVIEW_PR_NUMBER", "value" => pr_number },
          { "name" => "RELEASE", "value" => "latest" },
        ],
        "secrets" => secrets,
      },
    ],
  )
end

def accepted_diff
  events = []
  GOOGLE_KEYS.each do |key|
    secret_event = { "op" => "create", "type" => "sst:sst:Secret", "urn" => urn("sst:sst:Secret", key) }
    link_ref_event = { "op" => "create", "type" => "sst:sst:LinkRef", "urn" => urn("sst:sst:LinkRef", "#{key}LinkRef") }
    events.concat([secret_event, secret_event.dup, link_ref_event, link_ref_event.dup])
    events << { "op" => "create", "type" => "aws:ssm/parameter:Parameter", "urn" => urn("aws:ssm/parameter:Parameter", "#{key}Parameter") }
  end

  TASKS.each do |name|
    task_urn = urn("aws:ecs/taskDefinition:TaskDefinition", name, "sst:aws:Task")
    events << {
      "op" => "create-replacement",
      "type" => "aws:ecs/taskDefinition:TaskDefinition",
      "urn" => task_urn,
      "diffs" => ["containerDefinitions"],
      "old" => { "inputs" => { "containerDefinitions" => container_definitions(OLD_HOST, "787") } },
      "new" => { "inputs" => { "containerDefinitions" => container_definitions(NEW_HOST, "790", google: true) } },
    }
    events << {
      "op" => "replace",
      "type" => "aws:ecs/taskDefinition:TaskDefinition",
      "urn" => task_urn,
      "diffs" => ["containerDefinitions"],
    }
    events << { "op" => "delete-replaced", "type" => "aws:ecs/taskDefinition:TaskDefinition", "urn" => task_urn }
  end

  SERVICES.each do |name|
    events << {
      "op" => "update",
      "type" => "aws:ecs/service:Service",
      "urn" => urn("aws:ecs/service:Service", name, "sst:aws:Service"),
      "diffs" => ["taskDefinition"],
    }
  end

  STANDALONE_LINK_REFS.each do |name|
    events << {
      "op" => "update",
      "type" => "sst:sst:LinkRef",
      "urn" => urn("sst:sst:LinkRef", name),
      "diffs" => %w[include properties],
    }
  end

  events << {
    "op" => "create",
    "type" => "sst:aws:RouterUrlRoute",
    "urn" => urn("sst:aws:RouterUrlRoute", "GalaAppRouterRoutepr-790 dev:learngala:dev/"),
  }
  events << {
    "op" => "delete",
    "type" => "sst:aws:RouterUrlRoute",
    "urn" => urn("sst:aws:RouterUrlRoute", "GalaAppRouterRoutepr-787 dev:learngala:dev/"),
  }
  events << {
    "op" => "read",
    "type" => "aws:s3/bucketV2:BucketV2",
    "urn" => urn("aws:s3/bucketV2:BucketV2", "GalaMediaBucket"),
  }
  events << {
    "op" => "read",
    "type" => "aws:cloudfront/distribution:Distribution",
    "urn" => urn("aws:cloudfront/distribution:Distribution", "GalaAppRouterCdnDistribution"),
  }
  events
end

def run_verifier(path, old_host = OLD_HOST, new_host = NEW_HOST)
  Open3.capture3("ruby", VERIFIER, path, old_host, new_host)
end

def assert(message)
  raise message unless yield
end

Dir.mktmpdir("sst-preview-verifier-test") do |directory|
  path = File.join(directory, "diff.json")
  File.write(path, JSON.pretty_generate(accepted_diff))
  stdout, stderr, status = run_verifier(path)
  assert("approved diff must pass: #{stderr}") { status.success? }
  assert("success output must be value-free") do
    stdout.include?("PASS approved SST Google OAuth preview") &&
      stdout.include?("Google creates: 12; task revisions: 6; service pointers: 2") &&
      !stdout.include?("/gala/dev")
  end
  puts "PASS exact approved preview"

  FORBIDDEN_TYPES.each_with_index do |type, index|
    rejected = accepted_diff + [{ "op" => "update", "type" => type, "urn" => urn(type, "Forbidden#{index}") }]
    File.write(path, JSON.pretty_generate(rejected))
    _stdout, stderr, status = run_verifier(path)
    assert("#{type} mutation must be rejected") do
      !status.success? && stderr.include?("unapproved preview operation")
    end
    puts "PASS rejects #{type} mutation"
  end

  cases = {
    "seventh task definition" => lambda do |events|
      events << {
        "op" => "create-replacement",
        "type" => "aws:ecs/taskDefinition:TaskDefinition",
        "urn" => urn("aws:ecs/taskDefinition:TaskDefinition", "UnexpectedTask"),
        "diffs" => ["containerDefinitions"],
      }
    end,
    "task volumes change" => lambda do |events|
      events.find { |event| event["op"] == "create-replacement" }["diffs"] << "volumes"
    end,
    "third ECS service" => lambda do |events|
      events << {
        "op" => "update",
        "type" => "aws:ecs/service:Service",
        "urn" => urn("aws:ecs/service:Service", "UnexpectedService"),
        "diffs" => ["taskDefinition"],
      }
    end,
    "base dev route deletion" => lambda do |events|
      events << {
        "op" => "delete",
        "type" => "sst:aws:RouterUrlRoute",
        "urn" => urn("sst:aws:RouterUrlRoute", "GalaAppRouterRoutedev learngala:dev/"),
      }
    end,
    "extra Google resource" => lambda do |events|
      events << {
        "op" => "create",
        "type" => "sst:sst:Secret",
        "urn" => urn("sst:sst:Secret", "GOOGLE_UNAPPROVED"),
      }
    end,
  }.freeze

  cases.each do |name, mutation|
    rejected = accepted_diff
    mutation.call(rejected)
    File.write(path, JSON.pretty_generate(rejected))
    _stdout, _stderr, status = run_verifier(path)
    assert("#{name} must be rejected") { !status.success? }
    puts "PASS rejects #{name}"
  end

  File.write(path, JSON.pretty_generate(accepted_diff))
  _stdout, _stderr, status = run_verifier(path, "pr-786.dev.learngala.dev", NEW_HOST)
  assert("wrong old preview host must be rejected") { !status.success? }
  _stdout, _stderr, status = run_verifier(path, OLD_HOST, "pr-791.dev.learngala.dev")
  assert("wrong new preview host must be rejected") { !status.success? }
  puts "PASS rejects wrong preview hosts"

  File.write(path, "{not-json\n")
  _stdout, _stderr, status = run_verifier(path)
  assert("malformed JSON must be rejected") { !status.success? }
  puts "PASS rejects malformed JSON"
end
