#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("../..", __dir__)
ARM64_BASE_IMAGE =
  "353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1-arm64"
X86_BASE_IMAGE =
  "353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1"

def load_workflow(path)
  YAML.load_file(path, aliases: true)
end

def workflow_dispatch(workflow)
  workflow.fetch("on", workflow[true]).fetch("workflow_dispatch")
end

def assert(message)
  raise message unless yield
end

def assert_architecture_dispatch(path)
  workflow = load_workflow(path)
  input = workflow_dispatch(workflow).fetch("inputs").fetch("container_architecture")
  assert("#{path}: container_architecture must default to arm64") { input.fetch("default") == "arm64" }
  assert("#{path}: container_architecture must keep x86_64 override") { input.fetch("options").include?("x86_64") }
  assert("#{path}: container_architecture must include arm64") { input.fetch("options").include?("arm64") }
end

def assert_dynamic_base_image(path, job_name)
  workflow = load_workflow(path)
  job = workflow.fetch("jobs").fetch(job_name)
  env = job.fetch("env")
  runs = job.fetch("steps").filter_map { |step| step["run"] }

  assert("#{path}: must keep x86_64 base image env") { env.fetch("GALA_PRODUCTION_BASE_IMAGE_X86_64") == X86_BASE_IMAGE }
  assert("#{path}: must keep arm64 base image env") { env.fetch("GALA_PRODUCTION_BASE_IMAGE_ARM64") == ARM64_BASE_IMAGE }
  assert("#{path}: must not hard-code one GALA_PRODUCTION_BASE_IMAGE for all architectures") { !env.key?("GALA_PRODUCTION_BASE_IMAGE") }
  assert("#{path}: must export selected GALA_PRODUCTION_BASE_IMAGE") do
    runs.any? { |run| run.include?("GALA_PRODUCTION_BASE_IMAGE=${production_base_image}") }
  end
  assert("#{path}: must print selected base image") do
    runs.any? { |run| run.include?("Selected production base image for ${GALA_CONTAINER_ARCHITECTURE}") }
  end
end

def assert_qemu_setup(path, job_name)
  workflow = load_workflow(path)
  steps = workflow.fetch("jobs").fetch(job_name).fetch("steps")
  qemu_step = steps.find { |step| step["uses"] == "docker/setup-qemu-action@v3" }

  assert("#{path}: must set up QEMU for ARM64 Docker builds") { qemu_step }
  assert("#{path}: QEMU setup must be scoped to arm64 builds") do
    qemu_step.fetch("if").include?("GALA_CONTAINER_ARCHITECTURE") &&
      qemu_step.fetch("if").include?("arm64")
  end
  assert("#{path}: QEMU setup must include arm64 platform") do
    qemu_step.fetch("with").fetch("platforms") == "arm64"
  end
end

deploy = File.join(ROOT, ".github/workflows/deploy.yml")
preview = File.join(ROOT, ".github/workflows/preview.yml")
promote = File.join(ROOT, ".github/workflows/promote-production.yml")
rollback = File.join(ROOT, ".github/workflows/rollback.yml")

{
  deploy => "deploy",
  preview => "preview",
  promote => "promote-production",
}.each do |path, job_name|
  assert_architecture_dispatch(path)
  assert_dynamic_base_image(path, job_name)
  assert_qemu_setup(path, job_name)
end

deploy_env = load_workflow(deploy).fetch("jobs").fetch("deploy").fetch("env")
assert("#{deploy}: production ARM64 deploys must use full SST task-definition path") do
  deploy_env.fetch("GALA_ECS_ONLY_DEPLOY").include?("container_architecture != 'arm64'")
end

rollback_env = load_workflow(rollback).fetch("jobs").fetch("rollback").fetch("env")
assert("#{rollback}: release redeploy must default to ARM64") { rollback_env.fetch("GALA_CONTAINER_ARCHITECTURE") == "arm64" }
assert("#{rollback}: release redeploy must use ARM64 base image") { rollback_env.fetch("GALA_PRODUCTION_BASE_IMAGE") == ARM64_BASE_IMAGE }
assert_qemu_setup(rollback, "rollback")

puts "PASS workflow architecture defaults"
