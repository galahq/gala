#!/usr/bin/env bash

release_task_definition_payload() {
  local task_json="$1" image="$2" version="$3"

  jq \
    --arg image "$image" \
    --arg version "$version" '
      def upsert_env($name; $value):
        . as $env
        | if any(.[]; .name == $name)
          then map(if .name == $name then .value = $value else . end)
          else . + [{name: $name, value: $value}]
          end;
      del(
        .taskDefinitionArn, .revision, .status, .requiresAttributes,
        .compatibilities, .registeredAt, .registeredBy, .deregisteredAt
      )
      | .containerDefinitions |= map(
          .image = $image
          | .environment = ((.environment // [])
              | map(select(
                  .name != "GALA_RELEASE_ID" and
                  .name != "GALA_ASSET_PREFIX" and
                  .name != "GALA_RELEASE_VERSION" and
                  .name != "RELEASE" and
                  .name != "GITHUB_RUN_ID" and
                  .name != "GITHUB_SHA"
                ))
              | upsert_env("GALA_RELEASE"; $version)
              | map(if .name == "ASSET_HOST"
                    then .value |= sub("/releases/.*$"; "/releases/" + $version)
                    else . end))
        )
    ' <<<"$task_json"
}

release_register_task() {
  local current_arn="$1" image="$2" version="$3" stage="$4" role="$5"
  local task_json payload
  task_json="$(release_aws ecs describe-task-definition --task-definition "$current_arn" \
    --query taskDefinition --output json)"
  payload="$(release_task_definition_payload "$task_json" "$image" "$version")"
  printf '%s\n' "$payload" | release_aws ecs register-task-definition \
    --cli-input-json file:///dev/stdin \
    --tags "key=gala:stage,value=$stage" "key=gala:role,value=$role" \
      "key=gala:release,value=$version" \
    --query 'taskDefinition.taskDefinitionArn' --output text
}

release_service_task() {
  release_aws ecs describe-services --cluster "$1" --services "$2" \
    --query 'services[0].taskDefinition' --output text
}

release_update_service() {
  release_aws ecs update-service --cluster "$1" --service "$2" \
    --task-definition "$3" \
    --deployment-configuration 'deploymentCircuitBreaker={enable=true,rollback=true}' >/dev/null
}
