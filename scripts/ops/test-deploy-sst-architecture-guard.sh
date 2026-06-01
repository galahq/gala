#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TMPDIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMPDIR"
}
trap cleanup EXIT

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
    echo "${GALA_TEST_CURRENT_ARCHITECTURE:-X86_64}"
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
