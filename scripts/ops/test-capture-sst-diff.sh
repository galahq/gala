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
for name in $ENV_NAMES; do printf '%s=%s\n' "$name" "${!name-unset}" >>"$ENV_LOG"; done
printf 'DATABASE_URL=postgres://user:super-secret@example.invalid/db\n'
printf '%s\n' \
  'AWS_ACCESS_KEY_ID=HOSTILE_ACCESS_VALUE' \
  'AWS_SECRET_ACCESS_KEY=HOSTILE_SECRET_VALUE' \
  'AWS_SESSION_TOKEN=HOSTILE_SESSION_VALUE' \
  'CLOUDFLARE_API_TOKEN=HOSTILE_CF_VALUE' \
  'https://provider.invalid/object?X-Amz-Credential=HOSTILE_AMZ_CREDENTIAL&X-Amz-Signature=HOSTILE_AMZ_SIGNATURE&X-Amz-Security-Token=HOSTILE_AMZ_TOKEN' \
  'https://provider.invalid/object?X-Goog-Credential=HOSTILE_GOOG_CREDENTIAL&X-Goog-Signature=HOSTILE_GOOG_SIGNATURE' >&2
exit "${FAIL_NPM:-0}"
STUB
cat >"$TMP/bin/npx" <<'STUB'
#!/usr/bin/env bash
printf 'npx:%s\n' "$*" >>"$COMMAND_LOG"
for name in $ENV_NAMES; do printf '%s=%s\n' "$name" "${!name-unset}" >>"$ENV_LOG"; done
if [[ "$*" == "sst install" ]]; then
  printf 'AWS_SECRET_ACCESS_KEY: HOSTILE_INSTALL_SECRET\n' >&2
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
if [[ "${MUTATING_STDERR:-}" == 1 ]]; then
  printf 'provider requested refresh then apply\n' >&2
else
  printf 'diagnostic token=super-secret\n' >&2
fi
exit "${FAIL_DIFF:-0}"
STUB
chmod +x "$TMP/bin/npm" "$TMP/bin/npx"

ENV_NAMES='AWS_REGION AWS_DEFAULT_REGION AWS_PROFILE SST_STAGE DATABASE_URL REDIS_HOST REDIS_URL CACHE_URL GALA_EFFECTIVE_STAGE GALA_APP_IMAGE_URI GALA_WEB_IMAGE_URI GALA_IMAGE_URI IMAGE_URI GALA_RELEASE GALA_RELEASE_ID GALA_RELEASE_VERSION GALA_ASSET_PREFIX RELEASE GALA_ROUTE_HOST GALA_PREVIEW_HOST GALA_DOMAIN_NAME GALA_ROOT_DOMAIN GALA_CONTAINER_ARCHITECTURE GALA_PRODUCTION_DOCKERFILE GALA_ENABLE_CUSTOM_DOMAIN GALA_CLOUDFLARE_PROXY GALA_IMPORT_STATIC_ASSETS_BUCKET'
export PATH="$TMP/bin:$PATH" COMMAND_LOG="$TMP/commands" ENV_LOG="$TMP/env" ENV_NAMES
for name in $ENV_NAMES; do export "$name=leak"; done

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
[[ "$(rg -c '^AWS_REGION=us-west-2$' "$TMP/env")" == 3 ]] || fail "AWS_REGION contract"
[[ "$(rg -c '^AWS_DEFAULT_REGION=us-west-2$' "$TMP/env")" == 3 ]] || fail "AWS_DEFAULT_REGION contract"
[[ "$(rg -c '^AWS_PROFILE=fixture$' "$TMP/env")" == 3 ]] || fail "explicit profile contract"
[[ "$(rg -c '^SST_STAGE=dev$' "$TMP/env")" == 3 ]] || fail "SST stage contract"
for name in ${ENV_NAMES#AWS_REGION AWS_DEFAULT_REGION AWS_PROFILE SST_STAGE }; do
  [[ "$(rg -c "^${name}=unset$" "$TMP/env")" == 3 ]] || fail "$name was not unset"
done
if rg -q 'super-secret|postgres://user|HOSTILE_[A-Z_]+' "$TMP"/result.diagnostics; then
  fail "diagnostics leaked provider credential or signed URL value"
fi
rg -q 'AWS_ACCESS_KEY_ID=\[REDACTED\]' "$TMP"/result.diagnostics || fail "access key assignment not redacted"
rg -q 'X-Amz-Signature=\[REDACTED\]' "$TMP"/result.diagnostics || fail "signed URL query not redacted"

ARRAY_ENVELOPE=1 "$WRAPPER" dev --profile fixture --output "$TMP/array-result.json" >/dev/null
jq -e '.operations | length == 2' "$TMP/array-result.json" >/dev/null || fail "array envelope"

: >"$TMP/env"
unset GITHUB_ACTIONS AWS_WEB_IDENTITY_TOKEN_FILE AWS_PROFILE
"$WRAPPER" dev --output "$TMP/default-profile.json" >/dev/null
[[ "$(rg -c '^AWS_PROFILE=gala$' "$TMP/env")" == 3 ]] || fail "local default profile"

: >"$TMP/env"
export AWS_PROFILE=leak AWS_WEB_IDENTITY_TOKEN_FILE="$TMP/oidc-token"
"$WRAPPER" dev --output "$TMP/oidc-profile.json" >/dev/null
[[ "$(rg -c '^AWS_PROFILE=unset$' "$TMP/env")" == 3 ]] || fail "OIDC must be profileless"
unset AWS_WEB_IDENTITY_TOKEN_FILE AWS_PROFILE

assert_status() {
  local expected="$1" output="$2"; shift 2
  rm -f "$output"
  set +e
  "$@" >/dev/null 2>&1
  local actual=$?
  set -e
  [[ "$actual" == "$expected" ]] || fail "expected status $expected, got $actual"
  [[ ! -e "$output" ]] || fail "failed capture must not publish result"
}
assert_status 23 "$TMP/npm-failure.json" env FAIL_NPM=23 "$WRAPPER" dev --profile fixture --output "$TMP/npm-failure.json"
assert_status 24 "$TMP/install-failure.json" env FAIL_INSTALL=24 "$WRAPPER" dev --profile fixture --output "$TMP/install-failure.json"
assert_status 25 "$TMP/diff-failure.json" env FAIL_DIFF=25 "$WRAPPER" dev --profile fixture --output "$TMP/diff-failure.json"
assert_status 1 "$TMP/mutating-stderr.json" env MUTATING_STDERR=1 "$WRAPPER" dev --profile fixture --output "$TMP/mutating-stderr.json"

echo "PASS capture sst diff"
