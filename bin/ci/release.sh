#!/bin/bash -e

# 6-2024.12.04T2103-7d9147bf, latest

pushd "$PROJECT_ROOT"
trap 'popd' EXIT

version="$(gitdate.sh)"
semver="$(semver.sh build save)"

backend_dir="$PROJECT_ROOT"
tag_base="gala-backend"
version_tag="$tag_base:$version"
semver_tag="$tag_base:$semver"
latest_tag="$tag_base:latest"

region=us-east-1
account=173028465699
cluster=gala
service=gala-backend
worker_service=gala-backend-worker

# if -skip-build is passed, skip the build step
if [ "$1" != "-skip-build" ]; then
  echo "release $semver, version $version"
  echo "building $version_tag container for version $version"

  docker login -u AWS \
              -p "$(aws ecr get-login-password --region $region)" \
              $account.dkr.ecr.$region.amazonaws.com

  docker build -f Dockerfile \
               -t "$version_tag" \
               --build-arg release="$semver" \
               --build-arg rails_env=production \
              "$backend_dir"

  echo "built $version_tag"

  ID=$(docker images | grep $tag_base | head -n 1 | awk '{print $3}')
  docker tag "$ID" "$account.dkr.ecr.$region.amazonaws.com/$version_tag"
  docker tag "$ID" "$account.dkr.ecr.$region.amazonaws.com/$semver_tag"
  docker tag "$ID" "$account.dkr.ecr.$region.amazonaws.com/$latest_tag"
  docker push $account.dkr.ecr.$region.amazonaws.com/$version_tag
  docker push $account.dkr.ecr.$region.amazonaws.com/$semver_tag
  docker push $account.dkr.ecr.$region.amazonaws.com/$latest_tag
fi

echo "forcing new deployments of $service, $worker_service"

echo "deploying $service"
aws ecs update-service --region $region \
                       --cluster $cluster \
                       --service $service \
                       --force-new-deployment \
                       --no-cli-pager

echo "deploying $worker_service"
aws ecs update-service --region $region \
                       --cluster $cluster \
                       --service $worker_service \
                       --force-new-deployment \
                       --no-cli-pager

popd