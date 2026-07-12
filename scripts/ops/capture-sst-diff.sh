#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
usage() { echo "usage: capture-sst-diff.sh dev|production [--profile NAME] [--output FILE]" >&2; exit 2; }

[[ $# -ge 1 ]] || usage
stage="$1"
shift
[[ "$stage" == dev || "$stage" == production ]] || usage
profile=""
profile_set=false
output=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile) [[ $# -ge 2 && -n "$2" ]] || usage; profile="$2"; profile_set=true; shift 2 ;;
    --output) [[ $# -ge 2 && -n "$2" ]] || usage; output="$2"; shift 2 ;;
    *) usage ;;
  esac
done

if [[ "$profile_set" == false && -z "${GITHUB_ACTIONS:-}" && -z "${AWS_WEB_IDENTITY_TOKEN_FILE:-}" ]]; then
  profile="gala"
fi
if [[ -z "$output" ]]; then
  output="$ROOT/.work/sst-ergonomic-platform-refactor/evidence/sst-diff-${stage}.json"
fi
mkdir -p "$(dirname "$output")"
diagnostics="${output%.json}.diagnostics"
rm -rf "$diagnostics"
mkdir -p "$diagnostics"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

region="$(node "$ROOT/scripts/read-platform-constant.mjs" awsRegion)"
export AWS_REGION="$region" AWS_DEFAULT_REGION="$region"
if [[ -n "$profile" ]]; then export AWS_PROFILE="$profile"; else unset AWS_PROFILE; fi
unset DATABASE_URL REDIS_HOST REDIS_URL CACHE_URL GALA_EFFECTIVE_STAGE
unset GALA_APP_IMAGE_URI GALA_WEB_IMAGE_URI GALA_IMAGE_URI IMAGE_URI
unset GALA_RELEASE GALA_RELEASE_ID GALA_RELEASE_VERSION GALA_ASSET_PREFIX RELEASE
unset GALA_ROUTE_HOST GALA_PREVIEW_HOST GALA_DOMAIN_NAME GALA_ROOT_DOMAIN
unset GALA_CONTAINER_ARCHITECTURE GALA_PRODUCTION_DOCKERFILE
unset GALA_ENABLE_CUSTOM_DOMAIN GALA_CLOUDFLARE_PROXY GALA_IMPORT_STATIC_ASSETS_BUCKET

redact() {
  sed -E \
    -e 's#([A-Za-z][A-Za-z0-9+.-]*://)[^/@[:space:]]+@#\1[REDACTED]@#g' \
    -e 's#((token|password|secret|authorization|DATABASE_URL|REDIS_URL|CACHE_URL)[[:space:]]*[:=][[:space:]]*)[^[:space:]]+#\1[REDACTED]#Ig' \
    "$1" >"$2"
}

run_captured() {
  local name="$1"; shift
  set +e
  (cd "$ROOT/infra" && "$@") >"$tmp/$name.stdout" 2>"$tmp/$name.stderr"
  local status=$?
  set -e
  redact "$tmp/$name.stdout" "$diagnostics/$name.stdout.log"
  redact "$tmp/$name.stderr" "$diagnostics/$name.stderr.log"
  return "$status"
}

install_status=0
run_captured npm-ci npm ci --prefer-offline --no-audit --no-fund || install_status=$?
[[ "$install_status" -eq 0 ]] || { echo "npm ci failed with status $install_status" >&2; exit "$install_status"; }

sst_install_status=0
run_captured sst-install npx sst install || sst_install_status=$?
[[ "$sst_install_status" -eq 0 ]] || { echo "sst install failed with status $sst_install_status" >&2; exit "$sst_install_status"; }

set +e
(cd "$ROOT/infra" && npx sst diff --stage "$stage" --json) >"$tmp/diff.jsonl" 2>"$tmp/sst-diff.stderr"
diff_status=$?
set -e
redact "$tmp/sst-diff.stderr" "$diagnostics/sst-diff.stderr.log"
[[ "$diff_status" -eq 0 ]] || { echo "sst diff failed with status $diff_status" >&2; exit "$diff_status"; }
if rg -i '\b(refresh|apply|deploy|remove)\b' "$tmp/sst-diff.stderr" >/dev/null; then
  echo "sst diff diagnostics indicated a mutating operation" >&2
  exit 1
fi
if ! jq -s -e '
  all(.[]; type == "object") and
  all(.[]; ((has("op") and has("urn")) or (has("op")|not) and (has("urn")|not))) and
  all(.[] | select(has("op") and has("urn")); (.op|type) == "string" and (.urn|type) == "string")
' "$tmp/diff.jsonl" >/dev/null; then
  echo "sst diff stdout was not valid operation JSONL" >&2
  exit 1
fi
jq -s '
  map(select(has("op") and has("urn")))
  | map({op,urn,type:(.type // null),parent:(.parent // null)})
  | sort_by(.op,.urn,.type,.parent)
' "$tmp/diff.jsonl" >"$tmp/operations.json"

commit="$(git -C "$ROOT" rev-parse HEAD)"
constants_sha="$(shasum -a 256 "$ROOT/infra/platform.constants.json" | awk '{print $1}')"
jq -n \
  --arg commit "$commit" --arg constantsSha256 "$constants_sha" --arg stage "$stage" \
  --argjson installStatus "$install_status" --argjson sstInstallStatus "$sst_install_status" \
  --argjson diffStatus "$diff_status" --slurpfile operations "$tmp/operations.json" \
  '{commit:$commit,constantsSha256:$constantsSha256,stage:$stage,installStatus:$installStatus,sstInstallStatus:$sstInstallStatus,diffStatus:$diffStatus,operations:$operations[0]}' \
  >"$tmp/result.json"
mv "$tmp/result.json" "$output"
printf '%s\n' "$output"
