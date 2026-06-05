#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("../..", __dir__)
ARM64_BASE_IMAGE =
  "353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1-arm64"

WORKFLOW_DIR = File.join(ROOT, ".github/workflows")
EXPECTED_WORKFLOWS = {
  "ci.yml" => "ci",
  "deploy.yaml" => "deploy",
  "infra.yml" => "infra",
}.freeze

def load_workflow(path)
  YAML.load_file(path, aliases: true)
end

def workflow_dispatch(workflow)
  workflow.fetch("on", workflow[true]).fetch("workflow_dispatch")
end

def assert(message)
  raise message unless yield
end

workflow_files = Dir.children(WORKFLOW_DIR).sort
assert("workflow directory must contain only ci.yml, deploy.yaml, and infra.yml") do
  workflow_files == EXPECTED_WORKFLOWS.keys.sort
end

EXPECTED_WORKFLOWS.each do |filename, workflow_id|
  path = File.join(WORKFLOW_DIR, filename)
  workflow = load_workflow(path)
  job = workflow.fetch("jobs").fetch(workflow_id)

  assert("#{filename}: workflow name must be #{workflow_id}") { workflow.fetch("name") == workflow_id }
  assert("#{filename}: job id must be #{workflow_id}") { workflow.fetch("jobs").keys == [workflow_id] }
  assert("#{filename}: job must use ARM GitHub runner") { job.fetch("runs-on") == "ubuntu-24.04-arm" }
end

deploy = load_workflow(File.join(WORKFLOW_DIR, "deploy.yaml"))
deploy_inputs = workflow_dispatch(deploy).fetch("inputs")
assert("deploy.yaml: deploy inputs must be stage and user_data only") do
  deploy_inputs.keys == %w[stage user_data]
end
assert("deploy.yaml: user_data must be the only optional deploy input") do
  deploy_inputs.fetch("stage").fetch("required") == true &&
    deploy_inputs.fetch("user_data").fetch("required") == false
end
assert("deploy.yaml: deploy stage choices must be dev and production") do
  deploy_inputs.fetch("stage").fetch("options") == %w[dev production]
end

deploy_env = deploy.fetch("jobs").fetch("deploy").fetch("env")
assert("deploy.yaml: deploy must default to ARM64 containers") { deploy_env.fetch("GALA_CONTAINER_ARCHITECTURE") == "arm64" }
assert("deploy.yaml: deploy must use the ARM64 base image") { deploy_env.fetch("GALA_PRODUCTION_BASE_IMAGE") == ARM64_BASE_IMAGE }

infra = load_workflow(File.join(WORKFLOW_DIR, "infra.yml"))
infra_inputs = workflow_dispatch(infra).fetch("inputs")
assert("infra.yml: infra inputs must be command, stage, and preview only") do
  infra_inputs.keys == %w[command stage preview]
end
assert("infra.yml: command choices must be diff and deploy") do
  infra_inputs.fetch("command").fetch("options") == %w[diff deploy]
end
assert("infra.yml: stage choices must be dev and production") do
  infra_inputs.fetch("stage").fetch("options") == %w[dev production]
end
assert("infra.yml: preview must default to true") { infra_inputs.fetch("preview").fetch("default") == true }

infra_env = infra.fetch("jobs").fetch("infra").fetch("env")
assert("infra.yml: infra must default to ARM64 containers") { infra_env.fetch("GALA_CONTAINER_ARCHITECTURE") == "arm64" }
assert("infra.yml: infra must use the ARM64 base image") { infra_env.fetch("GALA_PRODUCTION_BASE_IMAGE") == ARM64_BASE_IMAGE }

puts "PASS workflow architecture defaults"
