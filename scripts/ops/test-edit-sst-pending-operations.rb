#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "open3"
require "tmpdir"

ROOT = File.expand_path("../..", __dir__)
EDITOR_SCRIPT = File.join(ROOT, "scripts/ops/edit-sst-pending-operations.rb")
EXPECTED_OPERATIONS = [
  {
    "type" => "creating",
    "resource" => {
      "urn" => "urn:pulumi:dev::gala::sst:aws:Redis$aws:elasticache/replicationGroup:ReplicationGroup::GalaCacheCluster",
    },
  },
  {
    "type" => "creating",
    "resource" => {
      "urn" => "urn:pulumi:dev::gala::sst:aws:Service$docker-build:index:Image::GalaWorkerImageGalaWorker",
    },
  },
].freeze

def checkpoint(pending_operations)
  {
    "version" => 3,
    "checkpoint" => {
      "stack" => "gala/dev",
      "latest" => {
        "manifest" => { "time" => "2026-06-15T04:07:27Z", "version" => "3.215.0" },
        "metadata" => { "environment" => { "exec.kind" => "cli" } },
        "pending_operations" => pending_operations,
        "resources" => [
          {
            "urn" => "urn:pulumi:dev::gala::pulumi:pulumi:Stack::gala-dev",
            "type" => "pulumi:pulumi:Stack",
          },
        ],
        "secrets_providers" => { "type" => "service", "state" => {} },
      },
    },
  }
end

def run_script(*arguments)
  Open3.capture3("ruby", EDITOR_SCRIPT, *arguments)
end

def assert(message)
  raise message unless yield
end

Dir.mktmpdir("sst-pending-operations-test") do |directory|
  cases = {
    "exact operations are removed" => [EXPECTED_OPERATIONS, true],
    "missing operation is rejected" => [EXPECTED_OPERATIONS.take(1), false],
    "additional operation is rejected" => [
      EXPECTED_OPERATIONS + [
        { "type" => "deleting", "resource" => { "urn" => "urn:pulumi:dev::gala::unexpected" } },
      ],
      false,
    ],
    "wrong operation type is rejected" => [
      EXPECTED_OPERATIONS.map.with_index do |operation, index|
        index.zero? ? operation.merge("type" => "updating") : operation
      end,
      false,
    ],
  }.freeze

  cases.each_with_index do |(name, (operations, expected_success)), index|
    path = File.join(directory, "case-#{index}.json")
    before = checkpoint(operations)
    File.write(path, JSON.pretty_generate(before))

    stdout, stderr, status = run_script(path)
    assert("#{name}: expected success=#{expected_success}, got #{status.exitstatus}: #{stderr}") do
      status.success? == expected_success
    end

    if expected_success
      after = JSON.parse(File.read(path))
      assert("#{name}: pending operations must be empty") do
        after.dig("checkpoint", "latest", "pending_operations") == []
      end
      before.fetch("checkpoint").fetch("latest").delete("pending_operations")
      after.fetch("checkpoint").fetch("latest").delete("pending_operations")
      assert("#{name}: all non-pending state must be preserved") { before == after }
      assert("#{name}: success output must be value-free") do
        stdout.include?("exactly two approved") && !stdout.include?("urn:pulumi")
      end
    else
      assert("#{name}: rejected checkpoint must remain unchanged") do
        JSON.parse(File.read(path)) == before
      end
      assert("#{name}: rejection must explain the exact-set guard") do
        stderr.include?("does not exactly match")
      end
    end

    puts "PASS #{name}"
  end

  before_path = File.join(directory, "before.json")
  after_path = File.join(directory, "after.json")
  before = checkpoint(EXPECTED_OPERATIONS)
  after = checkpoint([])
  File.write(before_path, JSON.pretty_generate(before))
  File.write(after_path, JSON.pretty_generate(after))

  stdout, stderr, status = run_script("--verify", before_path, after_path)
  assert("exact before/after pair must verify: #{stderr}") { status.success? }
  assert("verification output must be value-free") do
    stdout.include?("PASS exact pending-operation reconciliation") && !stdout.include?("urn:pulumi")
  end
  puts "PASS exact before and after verification"

  changed = checkpoint([])
  changed.dig("checkpoint", "latest", "resources") << { "urn" => "urn:pulumi:dev::gala::unexpected" }
  File.write(after_path, JSON.pretty_generate(changed))
  _stdout, stderr, status = run_script("--verify", before_path, after_path)
  assert("resource mutation must be rejected") do
    !status.success? && stderr.include?("changed outside pending_operations")
  end
  puts "PASS non-pending state mutation is rejected"
end
