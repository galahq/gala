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
GOOGLE_SECRET_KEYS = %w[
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  GOOGLE_MIGRATION_CLIENT_ID
  GOOGLE_MIGRATION_CLIENT_SECRET
].freeze

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

ci_text = workflow_text("ci.yml")
assert("ci.yml: contracts must test SST state reconciliation and preview allowlisting") do
  ci_text.include?("ruby scripts/ops/test-edit-sst-pending-operations.rb") &&
    ci_text.include?("ruby scripts/ops/test-verify-sst-google-oauth-preview.rb")
end
%w[
  npm\ test
  npm\ run\ check
  test-sst-dev-runtime-contracts.rb
  test-sst-module-boundaries.rb
].each do |fragment|
  assert("ci.yml: contracts must run #{fragment.tr('\\', '')}") do
    ci_text.include?(fragment.tr("\\", ""))
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
assert("deploy.yml: architecture must not be a runtime choice") { !deploy_env.key?("GALA_CONTAINER_ARCHITECTURE") }
assert("deploy.yml: deploy must not point ECS at a production base image") { !deploy_env.key?("GALA_PRODUCTION_BASE_IMAGE") }
assert("deploy.yml: routine releases must use canonical rapid mode") { deploy_env.fetch("GALA_RAPID_RELEASE") == "true" }
assert("deploy.yml: GitHub run number is the canonical counter") do
  deploy_env.fetch("GITHUB_RUN_NUMBER") == "${{ github.run_number }}"
end
assert("deploy.yml: scoped Cloudflare token must receive the provider default account id") do
  deploy_env.fetch("CLOUDFLARE_DEFAULT_ACCOUNT_ID") == "${{ secrets.CLOUDFLARE_ACCOUNT_ID }}"
end
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
assert("deploy.yml: routine deploy must not address the Heroku media bucket") { deploy_cors_runs.empty? }
assert("deploy.yml: workflow calls the release dispatcher exactly once") do
  workflow_text("deploy.yml").scan(/scripts\/deploy-sst\.sh/).length == 1
end
target = workflow_step_run(deploy, "deploy", "Resolve exact target")
assert("deploy.yml: preview identity must be the exact PR stage") do
  target.include?('effective_stage="pr-${pr_number}"') &&
    target.include?('url="https://pr-${pr_number}.dev.learngala.dev"')
end

deploy_wrapper = workflow_step_run(deploy, "deploy", "Deploy")
assert("deploy.yml: workflow must call only the thin dispatcher") do
  deploy_wrapper.scan(/scripts\/deploy-sst\.sh/).length == 1
end
assert("deploy.yml: workflow must not call SST directly") { !workflow_text("deploy.yml").match?(/sst (install|deploy|refresh)/) }

rapid_release = File.read(File.join(ROOT, "scripts/lib/rapid-release.sh"))
assert("rapid release must publish assets before its immutable manifest") do
  rapid_release.index("rapid_extract_assets") < rapid_release.index("release_publish_manifest")
end
assert("rapid release must use digest-pinned task definitions") do
  rapid_release.include?('@$(jq -r \'.digest\' <<<"$manifest")')
end
assert("rapid release must never refresh SST or mutate CloudFront") do
  !rapid_release.match?(/sst refresh|cloudfront/)
end
assert("SST commands must be confined to explicit infrastructure actions") do
  rapid_release.index("npx sst install") > rapid_release.index("rapid_run_infra_diff") &&
    rapid_release.index("npx sst deploy") > rapid_release.index("rapid_apply_infra_plan")
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
