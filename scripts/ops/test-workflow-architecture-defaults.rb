#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("../..", __dir__)

WORKFLOW_DIR = File.join(ROOT, ".github/workflows")
EXPECTED_WORKFLOWS = {
  "ci.yml" => "ci",
  "deploy.yml" => "deploy",
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
assert("workflow directory must contain only ci.yml, deploy.yml, and infra.yml") do
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

deploy = load_workflow(File.join(WORKFLOW_DIR, "deploy.yml"))
deploy_inputs = workflow_dispatch(deploy).fetch("inputs")
assert("deploy.yml: deploy inputs must be stage and user_data only") do
  deploy_inputs.keys == %w[stage user_data]
end
assert("deploy.yml: user_data must be the only optional deploy input") do
  deploy_inputs.fetch("stage").fetch("required") == true &&
    deploy_inputs.fetch("user_data").fetch("required") == false
end
assert("deploy.yml: deploy stage choices must be dev, nightly, and production") do
  deploy_inputs.fetch("stage").fetch("options") == %w[dev nightly production]
end

deploy_env = deploy.fetch("jobs").fetch("deploy").fetch("env")
assert("deploy.yml: deploy must default to ARM64 containers") { deploy_env.fetch("GALA_CONTAINER_ARCHITECTURE") == "arm64" }
assert("deploy.yml: deploy must use the single production Dockerfile") { deploy_env.fetch("GALA_PRODUCTION_DOCKERFILE") == "Dockerfile.production" }
assert("deploy.yml: deploy must not point ECS at a production base image") { !deploy_env.key?("GALA_PRODUCTION_BASE_IMAGE") }
assert("deploy.yml: deploy must define the nightly host") { deploy_env.fetch("GALA_NIGHTLY_DOMAIN_NAME") == "nightly.learngala.com" }
assert("deploy.yml: deploy must allow nightly to import shared dev runtime IDs") do
  %w[
    GALA_SHARED_DEV_VPC_ID
    GALA_SHARED_DEV_CLUSTER_ID
    GALA_SHARED_DEV_DATABASE_ID
    GALA_SHARED_DEV_CACHE_CLUSTER_ID
  ].all? { |key| deploy_env.key?(key) }
end

infra = load_workflow(File.join(WORKFLOW_DIR, "infra.yml"))
infra_inputs = workflow_dispatch(infra).fetch("inputs")
assert("infra.yml: infra inputs must be command, stage, and preview only") do
  infra_inputs.keys == %w[command stage preview]
end
assert("infra.yml: command choices must be diff and deploy") do
  infra_inputs.fetch("command").fetch("options") == %w[diff deploy]
end
assert("infra.yml: stage choices must be dev, nightly, and production") do
  infra_inputs.fetch("stage").fetch("options") == %w[dev nightly production]
end
assert("infra.yml: preview must default to true") { infra_inputs.fetch("preview").fetch("default") == true }

infra_env = infra.fetch("jobs").fetch("infra").fetch("env")
assert("infra.yml: infra must default to ARM64 containers") { infra_env.fetch("GALA_CONTAINER_ARCHITECTURE") == "arm64" }
assert("infra.yml: infra must not point ECS at a production base image") { !infra_env.key?("GALA_PRODUCTION_BASE_IMAGE") }
assert("infra.yml: infra must define the nightly host") { infra_env.fetch("GALA_NIGHTLY_DOMAIN_NAME") == "nightly.learngala.com" }
assert("infra.yml: infra must allow nightly to import shared dev runtime IDs") do
  %w[
    GALA_SHARED_DEV_VPC_ID
    GALA_SHARED_DEV_CLUSTER_ID
    GALA_SHARED_DEV_DATABASE_ID
    GALA_SHARED_DEV_CACHE_CLUSTER_ID
  ].all? { |key| infra_env.key?(key) }
end

puts "PASS workflow architecture defaults"
