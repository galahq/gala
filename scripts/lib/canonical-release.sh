#!/usr/bin/env bash

canonical_version() {
  local run_number="${1:-}"

  if [[ ! "$run_number" =~ ^[1-9][0-9]*$ ]]; then
    echo "Canonical releases require a positive numeric GITHUB_RUN_NUMBER." >&2
    return 1
  fi

  printf 'v%s\n' "$run_number"
}

release_manifest_json() {
  local version="$1"
  local commit="$2"
  local digest="$3"
  local created_at="$4"

  jq -cn \
    --arg version "$version" \
    --arg commit "$commit" \
    --arg digest "$digest" \
    --arg created_at "$created_at" \
    '{version: $version, commit: $commit, digest: $digest, created_at: $created_at}'
}

validate_release_manifest() {
  local manifest="$1"
  local expected_version="$2"
  local expected_commit="$3"
  local expected_digest="$4"

  jq -e \
    --arg version "$expected_version" \
    --arg commit "$expected_commit" \
    --arg digest "$expected_digest" '
      (keys | sort) == ["commit", "created_at", "digest", "version"] and
      .version == $version and
      .commit == $commit and
      .digest == $digest and
      (.created_at | type == "string" and
        test("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"))
    ' <<<"$manifest" >/dev/null
}
