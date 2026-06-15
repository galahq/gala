#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("../..", __dir__)

def repo_read(path)
  File.read(File.join(ROOT, path))
end

def assert(message)
  raise message unless yield
end

def compose_environment(service)
  environment = service.fetch("environment")

  case environment
  when Hash
    environment
  when Array
    environment.each_with_object({}) do |entry, result|
      key, value = entry.to_s.split("=", 2)
      result[key] = value
    end
  else
    raise "unsupported Compose environment format: #{environment.class}"
  end
end

dockerfile = repo_read("Dockerfile.production")
assert("Dockerfile.production: final image must expose port 3000") do
  dockerfile.match?(/^EXPOSE 3000$/)
end
assert("Dockerfile.production: final image must default to Puma") do
  dockerfile.include?('CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]')
end

puma = repo_read("config/puma.rb")
assert("config/puma.rb: Puma must bind to PORT with default 3000") do
  puma.include?("port(ENV.fetch('PORT') { 3000 })")
end

sst = repo_read("infra/sst.config.ts")
assert("infra/sst.config.ts: SST must build from Dockerfile.production by default") do
  sst.include?('"Dockerfile.production"')
end
assert("infra/sst.config.ts: web runtime environment must set PORT=3000") do
  sst.include?('PORT: "3000"')
end
assert("infra/sst.config.ts: web command must match production Puma") do
  sst.include?('command: ["bundle", "exec", "puma", "-C", "config/puma.rb"]')
end
assert("infra/sst.config.ts: web load balancer must forward HTTP to container port 3000") do
  sst.include?('{ listen: "80/http", forward: "3000/http" }') &&
    sst.include?('{ listen: "443/http", forward: "3000/http" }')
end
assert("infra/sst.config.ts: web health check must target /up on port 3000") do
  sst.include?('"3000/http":') &&
    sst.include?('path: "/up"') &&
    sst.include?('curl -f http://localhost:3000/up || exit 1')
end
assert("infra/sst.config.ts: web runtime environment must not use HTTP_PORT") do
  !sst.match?(/\bHTTP_PORT\b/)
end
assert("infra/sst.config.ts: web runtime environment must not use TARGET_PORT") do
  !sst.match?(/\bTARGET_PORT\b/)
end
assert("infra/sst.config.ts: SST must accept a deploy-provided preview host") do
  sst.include?("process.env.GALA_PREVIEW_HOST?.trim()")
end
assert("infra/sst.config.ts: SST must route dev and preview hosts when GALA_ROUTE_PREVIEW_HOST=true") do
  sst.include?('process.env.GALA_ROUTE_PREVIEW_HOST === "true"') &&
    sst.include?("const routeHosts = routePreviewHost") &&
    sst.include?("[devDomain, previewHost]") &&
    sst.include?("[devDomain, devWildcardDomain]")
end
assert("infra/sst.config.ts: Rails runtime must point ActiveStorage at the retained media bucket") do
  sst.include?('const mediaBucketName = "msc-gala"') &&
    sst.include?("S3_BUCKET: mediaBucketName")
end
assert("infra/sst.config.ts: static assets CloudFront must match the production public S3 origin") do
  sst.include?("domainName: staticAssetsBucket.domain") &&
    sst.include?("customOriginConfig") &&
    sst.include?('originProtocolPolicy: "https-only"') &&
    sst.include?('originSslProtocols: ["TLSv1.2"]') &&
    !sst.include?("new aws.cloudfront.OriginAccessControl") &&
    !sst.include?("originAccessControlId: staticAssetsOriginAccess.id")
end
assert("infra/sst.config.ts: static assets bucket must use one SST-managed scoped public policy") do
  sst.include?('policy: [') &&
    sst.include?('principals: "*"') &&
    sst.include?('actions: ["s3:GetObject"]') &&
    sst.include?('paths: ["releases/*", "manifests/*", "assets/*"]') &&
    sst.include?('publicAccessBlock: (args: any) => {') &&
    sst.include?("args.blockPublicPolicy = false") &&
    sst.include?("args.restrictPublicBuckets = false") &&
    !sst.include?('new aws.s3.BucketPolicy("GalaStaticAssetsPublicReadPolicy"')
end
assert("infra/sst.config.ts: ECS task roles must receive media S3 access through built-in task permissions") do
  sst.include?("const mediaAccessPermissions = [") &&
    sst.include?('actions: ["s3:ListBucket"]') &&
    sst.include?('actions: ["s3:GetObject", "s3:PutObject"]') &&
    sst.include?('permissions: mediaAccessPermissions')
end
assert("infra/sst.config.ts: media access must not rely only on detached raw role policies") do
  !sst.include?("new aws.iam.RolePolicy(`Gala${name}MediaAccess`")
end
assert("infra/sst.config.ts: SST must not contain nightly stage routing") do
  !sst.include?('stage === "nightly"') &&
    !sst.include?("isNightly") &&
    !sst.include?("nightly.learngala.com")
end
assert("infra/sst.config.ts: SST must not contain nightly shared-dev runtime behavior") do
  !sst.include?("GALA_SHARED_DEV_") &&
    !sst.include?("sharedDevResourceIds") &&
    !sst.include?("useSharedDevRuntime")
end
assert("infra/sst.config.ts: SST must not depend on GALA_NIGHTLY_DOMAIN_NAME") do
  !sst.include?("GALA_NIGHTLY_DOMAIN_NAME")
end

compose = YAML.load_file(File.join(ROOT, "docker-compose.yml"), aliases: true)
services = compose.fetch("services")
web = services.fetch("web")
web_environment = compose_environment(web)
assert("docker-compose.yml: local stack must include web, db, and redis services") do
  %w[web db redis].all? { |service| services.key?(service) }
end
assert("docker-compose.yml: local web DATABASE_URL must target db:5432") do
  web_environment.fetch("DATABASE_URL") == "postgres://gala:alpine@db:5432/gala"
end
assert("docker-compose.yml: local web REDIS_URL must target redis:6379") do
  web_environment.fetch("REDIS_URL") == "redis://redis:6379/0"
end
assert("docker-compose.yml: local web PORT must default to 3000") do
  web_environment.fetch("PORT") == "${PORT:-3000}"
end
assert("docker-compose.yml: local web must publish container port 3000") do
  web.fetch("ports").include?("${APP_HOST_PORT:-3000}:3000")
end
assert("docker-compose.yml: local redis must publish port 6379") do
  services.fetch("redis").fetch("ports").include?("${REDIS_HOST_PORT:-6379}:6379")
end

procfile = repo_read("Procfile.dev")
assert("Procfile.dev: local web process must bind Rails to port 3000") do
  procfile.include?("web: bin/rails s -b 0.0.0.0 -p 3000")
end

deploy_script = repo_read("scripts/deploy-sst.sh")
assert("scripts/deploy-sst.sh: deploy wrapper must pass Dockerfile.production into SST") do
  deploy_script.include?("GALA_PRODUCTION_DOCKERFILE=$PRODUCTION_DOCKERFILE")
end
assert("scripts/deploy-sst.sh: deploy wrapper must preserve preview host env for SST") do
  deploy_script.include?("GALA_PREVIEW_HOST=${GALA_PREVIEW_HOST:-}") &&
    deploy_script.include?("GALA_ROUTE_PREVIEW_HOST=${GALA_ROUTE_PREVIEW_HOST:-}")
end
assert("scripts/deploy-sst.sh: deploy wrapper must reject nightly stage") do
  deploy_script.include?("--stage STAGE            SST stage to deploy (dev|production).") &&
    deploy_script.include?('if [[ "$STAGE" != "dev" && "$STAGE" != "production" ]]; then') &&
    deploy_script.include?("Invalid stage: $STAGE (expected dev or production)")
end
assert("scripts/deploy-sst.sh: deploy wrapper must not contain nightly-only environment") do
  !deploy_script.include?("GALA_NIGHTLY_DOMAIN_NAME") &&
    !deploy_script.include?("GALA_SHARED_DEV_") &&
    !deploy_script.include?("nightly.learngala.com")
end
assert("scripts/deploy-sst.sh: deploy wrapper must not contain nightly-only base URL behavior") do
  !deploy_script.include?('$STAGE" == "nightly"') &&
    !deploy_script.include?("shared_dev_runtime")
end

%w[bin/dev docker-compose.yml Procfile.dev].each do |path|
  assert("#{path}: local stack must not depend on CMUX") do
    !repo_read(path).match?(/\bCMUX(?:_|$)/)
  end
end

puts "PASS sst dev runtime contracts"
