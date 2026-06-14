#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("../..", __dir__)

WORKFLOW_DIR = File.join(ROOT, ".github/workflows")
WORKFLOW_DOC_DIR = File.join(ROOT, "docs/ops/workflows")
EXPECTED_WORKFLOWS = {
  "ci.yml" => "ci",
  "deploy.yml" => "deploy",
}.freeze
EXPECTED_WORKFLOW_DOCS = EXPECTED_WORKFLOWS.transform_keys do |filename|
  filename.sub(/\.yml\z/, ".md")
end.freeze

def load_workflow(path)
  YAML.load_file(path, aliases: true)
end

def workflow_text(filename)
  File.read(File.join(WORKFLOW_DIR, filename))
end

def workflow_dispatch(workflow)
  workflow.fetch("on", workflow[true]).fetch("workflow_dispatch")
end

def workflow_steps(workflow, job_id)
  workflow.fetch("jobs").fetch(job_id).fetch("steps")
end

def workflow_run_blocks(workflow, job_id)
  workflow_steps(workflow, job_id).filter_map { |step| step["run"] }
end

def workflow_step_run(workflow, job_id, step_name)
  step = workflow_steps(workflow, job_id).find { |candidate| candidate["name"] == step_name }
  raise "#{job_id}: missing workflow step #{step_name.inspect}" unless step

  step.fetch("run")
end

def assert(message)
  raise message unless yield
end

workflow_files = Dir.children(WORKFLOW_DIR).sort
assert("workflow directory must contain only ci.yml and deploy.yml") do
  workflow_files == EXPECTED_WORKFLOWS.keys.sort
end

workflow_doc_files = Dir.children(WORKFLOW_DOC_DIR).sort
assert("workflow docs must contain one manpage per workflow") do
  workflow_doc_files == EXPECTED_WORKFLOW_DOCS.keys.sort
end

EXPECTED_WORKFLOWS.each do |filename, workflow_id|
  path = File.join(WORKFLOW_DIR, filename)
  workflow = load_workflow(path)
  job = workflow.fetch("jobs").fetch(workflow_id)
  doc_path = File.join(WORKFLOW_DOC_DIR, "#{workflow_id}.md")
  doc = File.read(doc_path)

  assert("#{filename}: workflow name must be #{workflow_id}") { workflow.fetch("name") == workflow_id }
  assert("#{filename}: job id must be #{workflow_id}") { workflow.fetch("jobs").keys == [workflow_id] }
  assert("#{filename}: job must use ARM GitHub runner") { job.fetch("runs-on") == "ubuntu-24.04-arm" }
  assert("#{doc_path}: doc must be a manpage(7)-style page") do
    doc.start_with?("# #{workflow_id}(7)\n\n## NAME\n") &&
      doc.include?(".github/workflows/#{filename}") &&
      doc.include?("## SYNOPSIS\n")
  end

  assert("#{filename}: workflow must not apply media bucket CORS") do
    !workflow_text(filename).match?(/sync-media-bucket-cors\.sh[^\n]*--apply/)
  end
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

deploy_runs = workflow_run_blocks(deploy, "deploy")
deploy_cors_runs = deploy_runs.grep(/sync-media-bucket-cors\.sh/)
assert("deploy.yml: deploy must check media bucket CORS") { deploy_cors_runs.any? }
assert("deploy.yml: deploy media bucket CORS check must not use --apply") do
  deploy_cors_runs.none? { |run| run.include?("--apply") }
end

deploy_metadata = workflow_step_run(deploy, "deploy", "Build release metadata")
assert("deploy.yml: deploy must derive a branch slug for dev preview hosts") do
  deploy_metadata.include?("branch_slug=")
end
assert("deploy.yml: dev deploy must derive a branch preview host under *.dev.learngala.dev") do
  deploy_metadata.include?('app_host="${branch_slug}.dev.${GALA_DOMAIN_NAME}"')
end
assert("deploy.yml: deploy must export the preview host for SST") do
  deploy_metadata.include?('echo "GALA_PREVIEW_HOST=${app_host}"')
end
assert("deploy.yml: deploy must export the preview base URL") do
  deploy_metadata.include?('echo "GALA_BASE_URL=${base_url}"')
end

deploy_operator_validation = workflow_step_run(deploy, "deploy", "Validate deploy operator")
assert("deploy.yml: diff sentinel must not be registered as a GitHub log mask") do
  deploy_operator_validation.include?('if [[ -n "${USER_DATA}" && "${USER_DATA}" != "diff" ]]; then')
end

deploy_wrapper = workflow_step_run(deploy, "deploy", "Deploy with SST script")
refresh_index = deploy_wrapper.index('npx sst refresh --stage "${SST_STAGE}"')
dry_run_index = deploy_wrapper.index("--dry-run")
assert("deploy.yml: diff mode must run sst refresh") { refresh_index }
assert("deploy.yml: diff mode must run the deploy wrapper dry run") { dry_run_index }
assert("deploy.yml: diff mode must run sst refresh before deploy wrapper dry run") do
  refresh_index < dry_run_index
end
assert("deploy.yml: diff mode must clear user_data before the dry run") do
  deploy_wrapper.include?('USER_DATA="" AWS_REGION="${AWS_REGION}" SST_STAGE="${SST_STAGE}" bash scripts/deploy-sst.sh')
end
assert("deploy.yml: deploy mode must remain outside the diff branch") do
  deploy_wrapper.include?('if [[ "${USER_DATA}" == "diff" ]]; then') &&
    deploy_wrapper.match?(/else\s+echo "Running deploy mode\."/)
end

checked_text = [
  Dir.children(WORKFLOW_DIR).map { |filename| workflow_text(filename) },
  Dir.children(WORKFLOW_DOC_DIR).map { |filename| File.read(File.join(WORKFLOW_DOC_DIR, filename)) },
  File.read(File.join(ROOT, "docs/agent-playbooks/dev-domain-preview-migration.md")),
  File.read(__FILE__),
].flatten.join("\n")
assert("checked workflow docs and tests must not instruct operators to dispatch infra.yml") do
  !checked_text.match?(/gh workflow run infra\.yml/)
end

puts "PASS workflow architecture defaults"
