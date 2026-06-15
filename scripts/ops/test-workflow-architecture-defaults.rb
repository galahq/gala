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
deploy_triggers = deploy.fetch("on", deploy[true])
deploy_inputs = workflow_dispatch(deploy).fetch("inputs")
assert("deploy.yml: deploy inputs must be stage and user_data only") do
  deploy_inputs.keys == %w[stage user_data]
end
assert("deploy.yml: user_data must be the only optional deploy input") do
  deploy_inputs.fetch("stage").fetch("required") == true &&
    deploy_inputs.fetch("user_data").fetch("required") == false
end
assert("deploy.yml: deploy stage choices must be dev and production only") do
  deploy_inputs.fetch("stage").fetch("options") == %w[dev production]
end
assert("deploy.yml: deploy must not have a scheduled nightly trigger") do
  !deploy_triggers.key?("schedule")
end

deploy_env = deploy.fetch("jobs").fetch("deploy").fetch("env")
assert("deploy.yml: deploy must default to ARM64 containers") { deploy_env.fetch("GALA_CONTAINER_ARCHITECTURE") == "arm64" }
assert("deploy.yml: deploy must use the single production Dockerfile") { deploy_env.fetch("GALA_PRODUCTION_DOCKERFILE") == "Dockerfile.production" }
assert("deploy.yml: deploy must not point ECS at a production base image") { !deploy_env.key?("GALA_PRODUCTION_BASE_IMAGE") }
assert("deploy.yml: deploy must not define nightly-specific environment") do
  (deploy_env.keys & %w[
    GALA_NIGHTLY_DOMAIN_NAME
    GALA_SHARED_DEV_VPC_ID
    GALA_SHARED_DEV_CLUSTER_ID
    GALA_SHARED_DEV_DATABASE_ID
    GALA_SHARED_DEV_CACHE_CLUSTER_ID
  ]).empty?
end

deploy_runs = workflow_run_blocks(deploy, "deploy")
deploy_cors_runs = deploy_runs.grep(/sync-media-bucket-cors\.sh/)
assert("deploy.yml: deploy must check media bucket CORS") { deploy_cors_runs.any? }
assert("deploy.yml: deploy media bucket CORS check must not use --apply") do
  deploy_cors_runs.none? { |run| run.include?("--apply") }
end

deploy_metadata = workflow_step_run(deploy, "deploy", "Build release metadata")
assert("deploy.yml: deploy must keep a branch slug fallback for dev deploys without an open PR") do
  deploy_metadata.include?("branch_slug=")
end
assert("deploy.yml: dev deploy must use pr-NUMBER preview hosts when a PR number exists") do
  deploy_metadata.include?('app_host="pr-${pr_number}.dev.${GALA_DOMAIN_NAME}"')
end
assert("deploy.yml: dev deploy must route the concrete preview host through the shared router") do
  deploy_metadata.include?('route_preview_host="true"') &&
    deploy_metadata.include?('echo "GALA_ROUTE_PREVIEW_HOST=${route_preview_host}"')
end
assert("deploy.yml: deploy must export the preview host for SST") do
  deploy_metadata.include?('echo "GALA_PREVIEW_HOST=${app_host}"')
end
assert("deploy.yml: deploy must export the preview base URL") do
  deploy_metadata.include?('echo "GALA_BASE_URL=${base_url}"')
end
assert("deploy.yml: release metadata must not contain a nightly branch") do
  !deploy_metadata.match?(/nightly|GALA_NIGHTLY_DOMAIN_NAME/)
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
assert("deploy.yml: sst_unlock mode must be labelled and must skip preview comments/releases") do
  comment_step = workflow_steps(deploy, "deploy").find { |step| step["name"] == "Comment on pull request" }
  release_step = workflow_steps(deploy, "deploy").find { |step| step["name"] == "Create production GitHub release" }
  summary_step = workflow_step_run(deploy, "deploy", "deploy summary")

  deploy_wrapper.include?('if [[ "${USER_DATA}" == "sst_unlock" ]]; then') &&
    deploy_wrapper.include?('echo "Running SST unlock mode."') &&
    comment_step.fetch("if").include?("env.USER_DATA != 'sst_unlock'") &&
    release_step.fetch("if").include?("env.USER_DATA != 'sst_unlock'") &&
    summary_step.include?('elif [[ "${USER_DATA}" == "sst_unlock" ]]; then') &&
    summary_step.include?('echo "- Mode: sst-unlock"')
end
assert("deploy.yml: final deploy path must not expose temporary remove_nightly") do
  !deploy_wrapper.include?("remove_nightly")
end
assert("deploy.yml: final deploy path must not call sst remove") do
  !deploy_wrapper.include?("--action remove") && !deploy_wrapper.include?("sst remove")
end

deploy_script = File.read(File.join(ROOT, "scripts/deploy-sst.sh"))
normal_deploy_start = deploy_script.index("sync_static_assets\n")
sst_deploy_index = deploy_script.index('run_sst_cmd env GALA_APP_IMAGE_URI="$REMOTE_IMAGE"')
normal_prune_index = deploy_script.index("prune_old_asset_releases", sst_deploy_index)
assert("deploy-sst.sh: normal deploy must upload assets before SST rollout") do
  normal_deploy_start && sst_deploy_index && normal_deploy_start < sst_deploy_index
end
assert("deploy-sst.sh: normal deploy must prune old assets only after successful SST rollout") do
  normal_prune_index && sst_deploy_index < normal_prune_index
end
assert("deploy-sst.sh: normal deploy must not prune old assets between upload and SST rollout") do
  !deploy_script[normal_deploy_start...sst_deploy_index].include?("prune_old_asset_releases")
end
assert("deploy-sst.sh: old asset pruning must sort releases by manifest LastModified, not prefix name") do
  deploy_script.include?("sort_by(.LastModified)") &&
    deploy_script.include?('select(.Key | endswith("/manifest.json"))')
end
assert("deploy-sst.sh: sst_unlock user_data must run SST unlock as an early-exit operator hook") do
  unlock_index = deploy_script.index("if user_data_is_sst_unlock_only; then")
  docker_index = deploy_script.index("require_command docker")
  unlock_index && docker_index && unlock_index < docker_index &&
    deploy_script.include?('run_sst_cmd npx sst unlock --stage "$STAGE"') &&
    deploy_script.include?("certificates|cloudflare_dns_cutover|database_migrate|seed_database|db_snapshot|db_backup|restart_ecs|refresh_indices|sst_unlock")
end

deploy_step_names = workflow_steps(deploy, "deploy").map { |step| step["name"] }
assert("deploy.yml: deploy must not update a nightly Git tag") do
  !deploy_step_names.include?("Update nightly Git tag")
end
assert("deploy.yml: deploy must not dispatch nightly CI") do
  !deploy_step_names.include?("Dispatch nightly CI")
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

operator_text = [
  Dir.children(WORKFLOW_DIR).map { |filename| workflow_text(filename) },
  Dir.children(WORKFLOW_DOC_DIR).map { |filename| File.read(File.join(WORKFLOW_DOC_DIR, filename)) },
  File.read(File.join(ROOT, "docs/agent-playbooks/dev-domain-preview-migration.md")),
].flatten.join("\n")
assert("workflow and operator docs must not instruct nightly deploy or smoke") do
  !operator_text.match?(/stage=nightly|--ref nightly|nightly\.learngala\.com|GALA_NIGHTLY|GALA_SHARED_DEV/)
end
assert("workflow and operator docs must use PR-number dev preview hosts") do
  operator_text.include?("pr-NUMBER.dev.learngala.dev") &&
    !operator_text.match?(/branch preview hosts|branch-derived hostnames|branch subdomains/)
end

public_doc_paths = Dir.glob(File.join(ROOT, "docs/**/*.md")).sort
research_doc_paths = public_doc_paths.select { |path| path.include?("/docs/research/") }
assert("public docs must not retain docs/research markdown files") do
  research_doc_paths.empty?
end
assert("public docs must retain a terse asset pipeline note") do
  File.file?(File.join(ROOT, "docs/asset-pipeline.md"))
end

public_docs_text = public_doc_paths.map { |path| File.read(path) }.join("\n")
assert("public docs must not contain GSD or .planning workflow residue") do
  !public_docs_text.match?(/GSD|\$gsd|\.planning/)
end
assert("public docs must not reference deleted private research docs") do
  !public_docs_text.match?(
    %r{docs/(?:research/(?:google-oauth-cutover|GCP_OAUTH|aws-sst-migration-plan|aws-sst-phase-1-preflight|aws-sst-secret-inventory|major-dependency-upgrade-analysis|gala_ao-nate_may-24|asset-pipeline)|(?:aws-sst-migration-plan|aws-sst-phase-1-preflight|aws-sst-secret-inventory|major-dependency-upgrade-analysis))\.md}
  )
end

puts "PASS workflow architecture defaults"
