#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT/scripts/lib/canonical-release.sh"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

[[ "$(canonical_version 412)" == "v412" ]] || fail "run number must become vN"

if canonical_version "" >/dev/null 2>&1; then
  fail "blank run number must fail"
fi
if canonical_version "12x" >/dev/null 2>&1; then
  fail "non-numeric run number must fail"
fi

created_at="2026-07-10T21:27:26Z"
manifest="$(release_manifest_json \
  v412 \
  2b808a57345f7cf1c975013c98c6e92da978bd64 \
  sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa \
  "$created_at")"

[[ "$(jq -r 'keys | sort | join(",")' <<<"$manifest")" == "commit,created_at,digest,version" ]] ||
  fail "manifest must contain exactly four fields"
[[ "$(jq -r '.version' <<<"$manifest")" == "v412" ]] || fail "manifest version mismatch"
[[ "$(jq -r '.created_at' <<<"$manifest")" == "$created_at" ]] || fail "manifest timestamp mismatch"

validate_release_manifest "$manifest" v412 \
  2b808a57345f7cf1c975013c98c6e92da978bd64 \
  sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

if validate_release_manifest "$manifest" v412 \
  3b808a57345f7cf1c975013c98c6e92da978bd64 \
  sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa >/dev/null 2>&1; then
  fail "different commit must fail"
fi
if validate_release_manifest "$manifest" v412 \
  2b808a57345f7cf1c975013c98c6e92da978bd64 \
  sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb >/dev/null 2>&1; then
  fail "different digest must fail"
fi

retry_manifest="$(release_manifest_json \
  "$(jq -r '.version' <<<"$manifest")" \
  "$(jq -r '.commit' <<<"$manifest")" \
  "$(jq -r '.digest' <<<"$manifest")" \
  "$(jq -r '.created_at' <<<"$manifest")")"
[[ "$retry_manifest" == "$manifest" ]] || fail "retry must preserve the original record"

echo "canonical release contract: PASS"
