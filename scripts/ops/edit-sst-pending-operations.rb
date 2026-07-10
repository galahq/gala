#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"

EXPECTED_OPERATIONS = [
  {
    "type" => "creating",
    "urn" => "urn:pulumi:dev::gala::sst:aws:Redis$aws:elasticache/replicationGroup:ReplicationGroup::GalaCacheCluster",
  },
  {
    "type" => "creating",
    "urn" => "urn:pulumi:dev::gala::sst:aws:Service$docker-build:index:Image::GalaWorkerImageGalaWorker",
  },
].freeze

def load_checkpoint(path)
  JSON.parse(File.binread(path))
end

def pending_operations(checkpoint)
  checkpoint.fetch("checkpoint").fetch("latest").fetch("pending_operations")
end

def operation_identity(operation)
  {
    "type" => operation.fetch("type"),
    "urn" => operation.fetch("resource").fetch("urn"),
  }
end

def require_expected_pending!(checkpoint)
  actual = pending_operations(checkpoint).map { |operation| operation_identity(operation) }
  expected = EXPECTED_OPERATIONS.sort_by { |item| [item.fetch("type"), item.fetch("urn")] }
  return if actual.sort_by { |item| [item.fetch("type"), item.fetch("urn")] } == expected

  raise "refusing state edit: pending operation set does not exactly match the approved two records"
end

def without_pending(checkpoint)
  copy = Marshal.load(Marshal.dump(checkpoint))
  copy.fetch("checkpoint").fetch("latest").delete("pending_operations")
  copy
end

def verify_pair!(before, after)
  require_expected_pending!(before)
  raise "refusing verification: edited pending_operations is not empty" unless pending_operations(after).empty?
  return if without_pending(before) == without_pending(after)

  raise "refusing verification: state changed outside pending_operations"
end

if ARGV.first == "--verify"
  raise "usage: #{$PROGRAM_NAME} --verify BEFORE AFTER" unless ARGV.length == 3

  verify_pair!(load_checkpoint(ARGV[1]), load_checkpoint(ARGV[2]))
  puts "PASS exact pending-operation reconciliation"
  exit 0
end

raise "usage: #{$PROGRAM_NAME} CHECKPOINT" unless ARGV.length == 1

path = ARGV.fetch(0)
before = load_checkpoint(path)
require_expected_pending!(before)
after = Marshal.load(Marshal.dump(before))
after.fetch("checkpoint").fetch("latest")["pending_operations"] = []
verify_pair!(before, after)
File.open(path, "wb", 0o600) { |file| file.write(JSON.pretty_generate(after) << "\n") }
puts "Removed exactly two approved pending-operation records; no other state field changed."
