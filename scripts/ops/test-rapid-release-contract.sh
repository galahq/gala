#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ARTIFACTS="$ROOT/scripts/lib/release-artifacts.sh"
ECS="$ROOT/scripts/lib/ecs-release.sh"
DEPLOY="$ROOT/scripts/deploy-sst.sh"

fail() { echo "FAIL: $*" >&2; exit 1; }

source "$ARTIFACTS"
source "$ECS"
source "$ROOT/scripts/lib/rapid-release.sh"

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
rapid_source="$(<"$ROOT/scripts/lib/rapid-release.sh")"
[[ "$rapid_source" == *'current_state" == "$expected_state'* ]] || fail "infra apply must gate state version"
[[ "$rapid_source" == *'Infrastructure diff changed after approval.'* ]] || fail "infra apply must gate fingerprint"
if [[ "$rapid_source" == *'sst refresh'* ]]; then fail "infra planning must never refresh"; fi

[[ "$(rapid_stage_host dev)" == "dev.learngala.dev" ]] || fail "durable dev target"
[[ "$(rapid_stage_host production)" == "learngala.dev" ]] || fail "durable production target"
[[ "$(rapid_stage_host pr-790)" == "pr-790.dev.learngala.dev" ]] || fail "preview target"
for target in pr-0 pr-0790 pr-790-extra local-nate nightly; do
  if rapid_stage_host "$target" >/dev/null 2>&1; then fail "existing resolver accepted $target"; fi
done

# Slice 1 records the hostile target/operation fixtures that the extracted
# infra-plan validator must reject once Slice 4 introduces that library.
if [[ -f "$ROOT/scripts/lib/infra-plan.sh" ]]; then
  source "$ROOT/scripts/lib/infra-plan.sh"
  for target in production dev pr-0 pr-0790 pr-790-extra local-nate; do
    if infra_preview_target "$target" 790 >/dev/null 2>&1; then
      fail "preview target fixture must reject $target"
    fi
  done
  [[ "$(infra_preview_target pr-790 790)" == pr-790 ]] || fail "exact preview target"

  foreign='[{"op":"create","urn":"urn:pulumi:pr-787::gala::sst:aws:Service::GalaWeb","type":"sst:aws:Service","parent":null}]'
  destructive='[{"op":"delete","urn":"urn:pulumi:pr-790::gala::aws:rds/instance:Instance::GalaDatabase","type":"aws:rds/instance:Instance","parent":null}]'
  shared='[{"op":"update","urn":"urn:pulumi:pr-790::gala::aws:s3/bucket:Bucket::GalaStaticAssets","type":"aws:s3/bucket:Bucket","parent":null}]'
  for fixture in "$foreign" "$destructive" "$shared"; do
    if infra_validate_preview_operations pr-790 "$fixture" >/dev/null 2>&1; then
      fail "unsafe infra-plan fixture was accepted"
    fi
  done
else
  echo "SKIP infra-plan malicious fixtures: scripts/lib/infra-plan.sh is a Slice 4 precondition"
fi

echo "rapid release contract: PASS"
