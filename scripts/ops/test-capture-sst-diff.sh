#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WRAPPER="$ROOT/scripts/ops/capture-sst-diff.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/bin"

fail() { echo "FAIL: $*" >&2; exit 1; }

cat >"$TMP/bin/npm" <<'STUB'
#!/usr/bin/env bash
printf 'npm:%s\n' "$*" >>"$COMMAND_LOG"
printf 'region=%s profile=%s stage=%s db=%s redis=%s effective=%s image=%s\n' \
  "${AWS_REGION:-}" "${AWS_PROFILE:-}" "${SST_STAGE:-}" "${DATABASE_URL-unset}" "${REDIS_URL-unset}" \
  "${GALA_EFFECTIVE_STAGE-unset}" "${GALA_APP_IMAGE_URI-unset}" >>"$ENV_LOG"
printf 'DATABASE_URL=postgres://user:super-secret@example.invalid/db\n'
printf 'token=super-secret\n' >&2
exit "${FAIL_NPM:-0}"
STUB
cat >"$TMP/bin/npx" <<'STUB'
#!/usr/bin/env bash
printf 'npx:%s\n' "$*" >>"$COMMAND_LOG"
printf 'region=%s profile=%s stage=%s db=%s redis=%s effective=%s image=%s\n' \
  "${AWS_REGION:-}" "${AWS_PROFILE:-}" "${SST_STAGE:-}" "${DATABASE_URL-unset}" "${REDIS_URL-unset}" \
  "${GALA_EFFECTIVE_STAGE-unset}" "${GALA_APP_IMAGE_URI-unset}" >>"$ENV_LOG"
if [[ "$*" == "sst install" ]]; then
  printf 'password=super-secret\n' >&2
  exit "${FAIL_INSTALL:-0}"
fi
[[ "$1 $2 $3 $4" == "sst diff --stage dev" && "$5" == "--json" ]] || exit 91
if [[ "${ARRAY_ENVELOPE:-}" == 1 ]]; then
  printf '%s\n' '[
    {"op":"same","urn":"urn:pulumi:dev::gala::x::b","type":"x","parent":"p"},
    {"op":"create","urn":"urn:pulumi:dev::gala::x::a"}
  ]'
  exit "${FAIL_DIFF:-0}"
fi
printf '%s\n' \
  '{"message":"preview"}' \
  '{"op":"same","urn":"urn:pulumi:dev::gala::x::b","type":"x","parent":"p"}' \
  '{"op":"create","urn":"urn:pulumi:dev::gala::x::a"}'
printf 'diagnostic token=super-secret\n' >&2
exit "${FAIL_DIFF:-0}"
STUB
chmod +x "$TMP/bin/npm" "$TMP/bin/npx"

export PATH="$TMP/bin:$PATH" COMMAND_LOG="$TMP/commands" ENV_LOG="$TMP/env"
export DATABASE_URL='postgres://leak' REDIS_HOST=leak REDIS_URL=leak CACHE_URL=leak
export GALA_EFFECTIVE_STAGE=production GALA_APP_IMAGE_URI=leak GALA_DOMAIN_NAME=leak

if "$WRAPPER" pr-790 --output "$TMP/rejected.json" >/dev/null 2>&1; then
  fail "preview stage must be rejected"
fi
[[ ! -e "$TMP/commands" ]] || fail "rejected stage ran commands"

"$WRAPPER" dev --profile fixture --output "$TMP/result.json"
jq -e '
  .stage == "dev" and .installStatus == 0 and .sstInstallStatus == 0 and .diffStatus == 0 and
  .operations == [
    {"op":"create","urn":"urn:pulumi:dev::gala::x::a","type":null,"parent":null},
    {"op":"same","urn":"urn:pulumi:dev::gala::x::b","type":"x","parent":"p"}
  ] and
  (.commit | test("^[0-9a-f]{40}$")) and
  (.constantsSha256 | test("^[0-9a-f]{64}$"))
' "$TMP/result.json" >/dev/null || fail "normalized result"
[[ "$(<"$TMP/commands")" == $'npm:ci --prefer-offline --no-audit --no-fund\nnpx:sst install\nnpx:sst diff --stage dev --json' ]] || fail "unexpected command path"
if rg -q 'refresh|apply|deploy' "$TMP/commands"; then fail "mutating SST path"; fi
if ! rg -q 'region=us-west-2 profile=fixture stage=dev db=unset redis=unset effective=unset image=unset' "$TMP/env"; then
  fail "region/profile/environment contract"
fi
if rg -q 'super-secret|postgres://user' "$TMP"/result.diagnostics; then fail "diagnostics leaked secret"; fi

ARRAY_ENVELOPE=1 "$WRAPPER" dev --profile fixture --output "$TMP/array-result.json" >/dev/null
jq -e '.operations | length == 2' "$TMP/array-result.json" >/dev/null || fail "array envelope"

if FAIL_NPM=23 "$WRAPPER" dev --profile fixture --output "$TMP/failure.json" >/dev/null 2>&1; then
  fail "npm failure must propagate"
fi
[[ ! -e "$TMP/failure.json" ]] || fail "failed capture must not publish result"

echo "PASS capture sst diff"
