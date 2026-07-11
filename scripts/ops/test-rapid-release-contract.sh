#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ARTIFACTS="$ROOT/scripts/lib/release-artifacts.sh"
ECS="$ROOT/scripts/lib/ecs-release.sh"
DEPLOY="$ROOT/scripts/deploy-sst.sh"

fail() { echo "FAIL: $*" >&2; exit 1; }

source "$ARTIFACTS"
source "$ECS"

[[ "$(release_asset_prefix v412)" == "releases/v412" ]] || fail "asset prefix"
[[ "$(release_manifest_key v412)" == "releases/v412/manifest.json" ]] || fail "manifest key"
[[ "$(release_channel_key dev)" == "channels/dev.json" ]] || fail "channel key"

channel="$(release_channel_json v412 v411)"
[[ "$(jq -cS . <<<"$channel")" == '{"current":"v412","previous":"v411"}' ]] || fail "channel shape"

payload='{"family":"gala-dev-web","taskDefinitionArn":"arn:old","revision":4,"status":"ACTIVE","requiresAttributes":[],"compatibilities":[],"registeredAt":"today","registeredBy":"me","containerDefinitions":[{"name":"web","image":"repo:old","environment":[{"name":"GALA_RELEASE_ID","value":"old"},{"name":"GALA_ASSET_PREFIX","value":"old"},{"name":"RELEASE","value":"old"},{"name":"UNCHANGED","value":"yes"}]}]}'
updated="$(release_task_definition_payload "$payload" 'repo@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' v412)"
[[ "$(jq -r '.containerDefinitions[0].image' <<<"$updated")" == repo@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa ]] || fail "digest pin"
[[ "$(jq -r '.containerDefinitions[0].environment[] | select(.name == "GALA_RELEASE") | .value' <<<"$updated")" == v412 ]] || fail "canonical env"
if jq -e '.containerDefinitions[0].environment[] | select(.name == "GALA_RELEASE_ID" or .name == "GALA_ASSET_PREFIX" or .name == "GALA_RELEASE_VERSION" or .name == "RELEASE")' <<<"$updated" >/dev/null; then
  fail "legacy release env remains"
fi
[[ "$(jq -r '.containerDefinitions[0].environment[] | select(.name == "UNCHANGED") | .value' <<<"$updated")" == yes ]] || fail "unrelated env changed"

rg -q 'rapid_release_main' "$DEPLOY" || fail "deploy entry point must dispatch rapid releases"
if rg -n 'docker push .*:latest|cloudfront create-invalidation' "$ROOT/scripts/lib/release-artifacts.sh" "$ROOT/scripts/lib/ecs-release.sh"; then
  fail "rapid release libraries must not write latest or invalidate CloudFront"
fi
if rg -n 'sst (install|deploy|refresh)' "$ROOT/scripts/lib/release-artifacts.sh" "$ROOT/scripts/lib/ecs-release.sh"; then
  fail "rapid release libraries must not invoke SST"
fi

echo "rapid release contract: PASS"
