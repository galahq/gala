#!/usr/bin/env bash

set -euo pipefail

OPERATOR_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPERATOR_REPO_ROOT="$(cd "${OPERATOR_SCRIPT_DIR}/../.." && pwd)"

operator_log() {
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*"
}

operator_summary() {
  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    echo "$*" >> "$GITHUB_STEP_SUMMARY"
  else
    echo "$*"
  fi
}

operator_require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

operator_reject_secret_like_input() {
  local name="$1"
  local value="${2:-}"

  if [[ -z "$value" ]]; then
    return
  fi

  if [[ "$value" =~ (DATABASE_URL|REDIS_URL|AWS_SECRET|SECRET_KEY|PASSWORD=|TOKEN=|PRIVATE_KEY) ]]; then
    echo "Refusing ${name}: input looks like a secret." >&2
    exit 1
  fi

  case "$value" in
    *";"*|*'`'*|*'$'*|*"("*|*")"*|*"|"*|*"&"*|*"<"*|*">"*)
      echo "Refusing ${name}: shell metacharacters are not allowed." >&2
      exit 1
      ;;
  esac
}

operator_require_codeowner_actor() {
  local actor="$1"

  case "$actor" in
    waisaed|papes1ns|cbothner|michaelkli1998)
      operator_log "CODEOWNER actor authorized: ${actor}"
      ;;
    *)
      echo "Refusing production operation: ${actor} is not in CODEOWNERS." >&2
      exit 1
      ;;
  esac
}

operator_require_confirmation() {
  local stage="$1"
  local operation="$2"
  local target="$3"
  local dry_run="$4"
  local confirmation="${5:-}"
  local expected

  if [[ "$stage" != "production" || "$dry_run" == "true" ]]; then
    return
  fi

  expected="${operation} production ${target}"
  if [[ "$confirmation" != "$expected" ]]; then
    {
      echo "Refusing production mutation."
      echo "Expected confirmation: ${expected}"
    } >&2
    exit 1
  fi
}

operator_outputs_file() {
  echo "${SST_OUTPUTS_FILE:-${OPERATOR_REPO_ROOT}/infra/.sst/outputs.json}"
}

operator_require_outputs_file() {
  local file
  file="$(operator_outputs_file)"
  if [[ ! -f "$file" ]]; then
    echo "Missing SST outputs file: ${file}" >&2
    echo "Run the workflow output-loading step before this operation." >&2
    exit 1
  fi
}

operator_read_output() {
  local key="$1"
  operator_require_outputs_file
  jq -r --arg key "$key" '.[$key] // empty' "$(operator_outputs_file)"
}

operator_read_output_array_csv() {
  local key="$1"
  operator_require_outputs_file
  jq -r --arg key "$key" '.[$key] // [] | join(",")' "$(operator_outputs_file)"
}

operator_aws_uses_profile() {
  [[ -z "${GITHUB_ACTIONS:-}" && -z "${AWS_ACCESS_KEY_ID:-}" ]]
}

operator_aws_cmd() {
  local region="${AWS_REGION:-us-west-2}"
  local profile="${AWS_PROFILE:-gala}"
  local stage="${SST_STAGE:-dev}"

  if operator_aws_uses_profile; then
    AWS_PROFILE="$profile" AWS_REGION="$region" SST_STAGE="$stage" aws --region "$region" --profile "$profile" "$@"
  else
    AWS_REGION="$region" SST_STAGE="$stage" aws --region "$region" "$@"
  fi
}

operator_log_aws_cmd() {
  local region="${AWS_REGION:-us-west-2}"
  local profile="${AWS_PROFILE:-gala}"
  local stage="${SST_STAGE:-dev}"

  if operator_aws_uses_profile; then
    operator_log "RUN: AWS_PROFILE=${profile} AWS_REGION=${region} SST_STAGE=${stage} aws --region ${region} --profile ${profile} $*"
  else
    operator_log "RUN: AWS_REGION=${region} SST_STAGE=${stage} aws --region ${region} $*"
  fi
}

operator_run_aws_cmd() {
  operator_log_aws_cmd "$*"
  operator_aws_cmd "$@"
}

operator_cluster_arn() {
  operator_read_output migrationClusterArn
}

operator_service_name() {
  case "$1" in
    web) operator_read_output webServiceName ;;
    worker) operator_read_output workerServiceName ;;
    *) echo "Unknown service: $1" >&2; exit 1 ;;
  esac
}

operator_task_network_config() {
  local prefix="$1"
  local subnets security_groups assign_public_ip

  subnets="$(operator_read_output_array_csv "${prefix}Subnets")"
  security_groups="$(operator_read_output_array_csv "${prefix}SecurityGroups")"
  assign_public_ip="$(operator_read_output "${prefix}AssignPublicIp")"

  if [[ -z "$subnets" || -z "$security_groups" ]]; then
    echo "Missing task network outputs for prefix ${prefix}." >&2
    exit 1
  fi

  if [[ "$assign_public_ip" == "true" ]]; then
    assign_public_ip="ENABLED"
  else
    assign_public_ip="DISABLED"
  fi

  echo "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$security_groups],assignPublicIp=$assign_public_ip}"
}

operator_run_ecs_task_from_outputs() {
  local prefix="$1"
  local command_json="${2:-}"
  local dry_run="${3:-true}"
  local cluster task_definition network_config container_name overrides
  local args

  cluster="$(operator_read_output "${prefix}ClusterArn")"
  task_definition="$(operator_read_output "${prefix}TaskDefinitionArn")"
  network_config="$(operator_task_network_config "$prefix")"

  if [[ -z "$cluster" || -z "$task_definition" ]]; then
    echo "Missing ECS task outputs for prefix ${prefix}." >&2
    exit 1
  fi

  args=(
    ecs run-task
    --cluster "$cluster"
    --task-definition "$task_definition"
    --launch-type FARGATE
    --network-configuration "$network_config"
  )

  if [[ -n "$command_json" ]]; then
    container_name="$(operator_aws_cmd ecs describe-task-definition \
      --task-definition "$task_definition" \
      --query 'taskDefinition.containerDefinitions[0].name' \
      --output text)"
    overrides="$(jq -cn --arg name "$container_name" --argjson command "$command_json" '{containerOverrides:[{name:$name,command:$command}]}')"
    args+=(--overrides "$overrides")
  fi

  operator_summary "- ECS task prefix: ${prefix}"
  operator_summary "- ECS cluster: ${cluster}"
  operator_summary "- ECS task definition: ${task_definition}"
  operator_summary "- Dry run: ${dry_run}"

  if [[ "$dry_run" == "true" ]]; then
    operator_log_aws_cmd "${args[@]}"
  else
    operator_run_aws_cmd "${args[@]}" >/dev/null
  fi
}

operator_update_service_task_definition() {
  local service_kind="$1"
  local task_definition="$2"
  local dry_run="$3"
  local cluster service current_task_definition

  cluster="$(operator_cluster_arn)"
  service="$(operator_service_name "$service_kind")"

  if [[ -z "$cluster" || -z "$service" || -z "$task_definition" ]]; then
    echo "Missing rollback target for ${service_kind}." >&2
    exit 1
  fi

  current_task_definition="$(operator_aws_cmd ecs describe-services \
    --cluster "$cluster" \
    --services "$service" \
    --query 'services[0].taskDefinition' \
    --output text)"

  operator_summary "- Service: ${service_kind}"
  operator_summary "  - Cluster: ${cluster}"
  operator_summary "  - Service name: ${service}"
  operator_summary "  - Current task definition: ${current_task_definition}"
  operator_summary "  - Requested task definition: ${task_definition}"
  operator_summary "  - Dry run: ${dry_run}"

  if [[ "$dry_run" == "true" ]]; then
    operator_log_aws_cmd ecs update-service --cluster "$cluster" --service "$service" --task-definition "$task_definition"
  else
    operator_run_aws_cmd ecs update-service \
      --cluster "$cluster" \
      --service "$service" \
      --task-definition "$task_definition" >/dev/null
  fi
}

operator_invalidate_cloudfront_outputs() {
  local paths="$1"
  local dry_run="$2"
  local key distribution_id

  for key in appRouterDistributionId appCdnDistributionId staticAssetsDistributionId; do
    distribution_id="$(operator_read_output "$key")"
    if [[ -z "$distribution_id" || "$distribution_id" == "null" ]]; then
      continue
    fi

    operator_summary "- CloudFront ${key}: ${distribution_id}"
    operator_summary "  - Paths: ${paths}"
    operator_summary "  - Dry run: ${dry_run}"

    if [[ "$dry_run" == "true" ]]; then
      operator_log_aws_cmd cloudfront create-invalidation --distribution-id "$distribution_id" --paths "$paths"
    else
      operator_run_aws_cmd cloudfront create-invalidation \
        --distribution-id "$distribution_id" \
        --paths "$paths" >/dev/null
    fi
  done
}
