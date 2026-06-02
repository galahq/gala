#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TMPDIR="$(mktemp -d)"
PRODUCTION_BASE_URL="${GALA_TEST_PRODUCTION_BASE_URL:-https://learngala.dev}"
PRODUCTION_HTTP_BASE_URL="${GALA_TEST_PRODUCTION_HTTP_BASE_URL:-http://GalaWebLoadBala.example.test}"
DEV_HTTPS_BASE_URL="${GALA_TEST_DEV_HTTPS_BASE_URL:-}"
DEV_HTTP_BASE_URL="${GALA_TEST_DEV_HTTP_BASE_URL:-http://GalaWebLoadBala.example.test}"

cleanup() {
  rm -rf "$TMPDIR"
}
trap cleanup EXIT

if [[ -z "$DEV_HTTPS_BASE_URL" ]]; then
  echo "Set GALA_TEST_DEV_HTTPS_BASE_URL to the dev or preview HTTPS base URL under test." >&2
  exit 1
fi

cat > "${TMPDIR}/aws" <<'AWS'
#!/usr/bin/env bash

set -euo pipefail

while [[ $# -gt 0 ]]; do
  case "$1" in
    --region|--profile)
      shift 2
      ;;
    --*)
      shift
      ;;
    *)
      break
      ;;
  esac
done

if [[ "${1:-}" != "ecs" ]]; then
  echo "unexpected aws service: $*" >&2
  exit 1
fi
shift

operation="${1:-}"
shift || true

case "$operation" in
  list-clusters)
    echo "arn:aws:ecs:us-west-2:353760060567:cluster/gala-dev-GalaCluster"
    ;;
  list-services)
    if [[ "$*" == *GalaWeb* ]]; then
      echo "arn:aws:ecs:us-west-2:353760060567:service/gala-dev-GalaCluster/gala-dev-GalaWebService"
    elif [[ "$*" == *GalaWorker* ]]; then
      echo "arn:aws:ecs:us-west-2:353760060567:service/gala-dev-GalaCluster/gala-dev-GalaWorkerService"
    else
      echo "unexpected list-services query: $*" >&2
      exit 1
    fi
    ;;
  describe-services)
    service=""
    while [[ $# -gt 0 ]]; do
      case "$1" in
        --services)
          service="$2"
          shift 2
          ;;
        *)
          shift
          ;;
      esac
    done

    if [[ "$service" == *Worker* ]]; then
      echo "arn:aws:ecs:us-west-2:353760060567:task-definition/gala-worker:1"
    else
      echo "arn:aws:ecs:us-west-2:353760060567:task-definition/gala-web:1"
    fi
    ;;
  describe-task-definition)
    if [[ "$*" == *"runtimePlatform.cpuArchitecture"* ]]; then
      echo "${GALA_TEST_CURRENT_ARCHITECTURE:-X86_64}"
    else
      cat <<JSON
{
  "taskDefinition": {
    "family": "gala-web",
    "taskRoleArn": "arn:aws:iam::353760060567:role/gala-task",
    "executionRoleArn": "arn:aws:iam::353760060567:role/gala-execution",
    "networkMode": "awsvpc",
    "containerDefinitions": [
      {
        "name": "app",
        "image": "example.test/gala:old",
        "environment": [
          { "name": "BASE_URL", "value": "http://old-alb.example.test" },
          { "name": "FORCE_SSL", "value": "false" },
          { "name": "ASSET_HOST", "value": "https://old-assets.example.test" }
        ]
      }
    ],
    "volumes": [],
    "placementConstraints": [],
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "1024",
    "memory": "2048",
    "runtimePlatform": {
      "cpuArchitecture": "${GALA_TEST_CURRENT_ARCHITECTURE:-X86_64}",
      "operatingSystemFamily": "LINUX"
    }
  }
}
JSON
    fi
    ;;
  *)
    echo "unexpected ecs operation: $operation $*" >&2
    exit 1
    ;;
esac
AWS
chmod +x "${TMPDIR}/aws"

run_case() {
  local name="$1"
  local requested_architecture="$2"
  local current_architecture="$3"
  local mode="$4"
  local expected_status="$5"
  local expected_pattern="$6"
  local output_file="${TMPDIR}/${name//[^A-Za-z0-9_.-]/_}.log"
  local status

  set +e
  PATH="${TMPDIR}:$PATH" \
    AWS_REGION=us-west-2 \
    SST_STAGE=dev \
    GALA_ECS_ONLY_DEPLOY=true \
    GALA_DEPLOY_SST_TEST_ECS_ONLY_ARCHITECTURE_GUARD=true \
    GALA_CONTAINER_ARCHITECTURE="$requested_architecture" \
    GALA_TEST_CURRENT_ARCHITECTURE="$current_architecture" \
    bash "${REPO_ROOT}/scripts/deploy-sst.sh" \
      --branch phase28-architecture-guard \
      --stage dev \
      $mode \
      >"$output_file" 2>&1
  status=$?
  set -e

  if [[ "$expected_status" == "pass" && "$status" -ne 0 ]]; then
    cat "$output_file" >&2
    echo "Expected pass for ${name}; got exit ${status}." >&2
    exit 1
  fi

  if [[ "$expected_status" == "fail" && "$status" -eq 0 ]]; then
    cat "$output_file" >&2
    echo "Expected failure for ${name}; got exit 0." >&2
    exit 1
  fi

  if ! grep -Eq "$expected_pattern" "$output_file"; then
    cat "$output_file" >&2
    echo "Missing expected output for ${name}: ${expected_pattern}" >&2
    exit 1
  fi

  echo "PASS ${name}"
}

run_case "dry-run-mismatch" "arm64" "X86_64" "--dry-run" "fail" "Refusing ECS-only rollout: GALA_ECS_ONLY_DEPLOY=true is image-only"
run_case "live-mismatch" "arm64" "X86_64" "" "fail" "full SST task-definition deployment path"
run_case "dry-run-match" "arm64" "ARM64" "--dry-run" "pass" "ECS-only architecture guard test completed for dry run"
run_case "live-match" "arm64" "ARM64" "" "pass" "ECS-only architecture guard test completed for live rollout"

run_payload_case() {
  local name="$1"
  local stage="$2"
  local base_url="$3"
  local expected_status="$4"
  local expected_pattern="$5"
  local output_file="${TMPDIR}/${name//[^A-Za-z0-9_.-]/_}.log"
  local status

  set +e
  PATH="${TMPDIR}:$PATH" \
    AWS_REGION=us-west-2 \
    SST_STAGE="$stage" \
    GALA_DEPLOY_SST_TEST_ECS_ONLY_PAYLOAD=true \
    GALA_CONTAINER_ARCHITECTURE=x86_64 \
    GALA_BASE_URL="$base_url" \
    GALA_DOMAIN_NAME=learngala.dev \
    bash "${REPO_ROOT}/scripts/deploy-sst.sh" \
      --branch phase28-architecture-guard \
      --stage "$stage" \
      >"$output_file" 2>&1
  status=$?
  set -e

  if [[ "$expected_status" == "pass" && "$status" -ne 0 ]]; then
    cat "$output_file" >&2
    echo "Expected pass for ${name}; got exit ${status}." >&2
    exit 1
  fi

  if [[ "$expected_status" == "fail" && "$status" -eq 0 ]]; then
    cat "$output_file" >&2
    echo "Expected failure for ${name}; got exit 0." >&2
    exit 1
  fi

  if ! grep -Eq "$expected_pattern" "$output_file"; then
    cat "$output_file" >&2
    echo "Missing expected output for ${name}: ${expected_pattern}" >&2
    exit 1
  fi

  echo "PASS ${name}"
}

run_payload_case "production-payload-repairs-runtime-url" "production" "$PRODUCTION_BASE_URL" "pass" "BASE_URL=${PRODUCTION_BASE_URL}"
run_payload_case "production-payload-enables-force-ssl" "production" "$PRODUCTION_BASE_URL" "pass" "FORCE_SSL=true"
run_payload_case "production-http-base-url-refused" "production" "$PRODUCTION_HTTP_BASE_URL" "fail" "production BASE_URL must use https://"
run_payload_case "dev-https-payload-enables-force-ssl" "dev" "$DEV_HTTPS_BASE_URL" "pass" "FORCE_SSL=true"
run_payload_case "dev-http-payload-keeps-force-ssl-off" "dev" "$DEV_HTTP_BASE_URL" "pass" "FORCE_SSL=false"
