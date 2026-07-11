#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("../..", __dir__)
GOOGLE_SECRET_KEYS = %w[
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  GOOGLE_MIGRATION_CLIENT_ID
  GOOGLE_MIGRATION_CLIENT_SECRET
].freeze
RAILS_TASK_DEFINITION_NAMES = %w[
  GalaWeb
  GalaWorker
  GalaMigrate
  GalaSeedDatabase
  GalaRefreshIndices
  GalaWeeklyReport
].freeze
APPROVED_BASTION_AMIS = {
  "dev" => "ami-08c28b6151a0ba92f",
  "production" => "ami-0a2a049c945b84826",
}.freeze

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

infra_paths = Dir.glob(File.join(ROOT, "infra", "**", "*.ts"))
  .reject { |path| path.include?("/.sst/") || path.include?("/test/") || path.end_with?("sst-env.d.ts") }
  .sort
sst = infra_paths.map { |path| File.read(path) }.join("\n")

assert("infra TypeScript contract loader must include modular sources") do
  %w[config.ts sst.config.ts].all? do |name|
    infra_paths.any? { |path| path.end_with?("/#{name}") }
  end
end

assert("infra/assets.ts: static asset resources must have a focused module") do
  infra_paths.any? { |path| path.end_with?("/infra/assets.ts") }
end

assert("infra/platform.ts: durable AWS foundation must have a focused module") do
  infra_paths.any? { |path| path.end_with?("/infra/platform.ts") }
end

assert("infra runtime and durable stage modules must exist") do
  %w[
    infra/runtime.ts
    infra/stages/dev.ts
    infra/stages/production.ts
    infra/stages/index.ts
  ].all? { |suffix| infra_paths.any? { |path| path.end_with?(suffix) } }
end
assert("infra TypeScript: SST must build from Dockerfile.production by default") do
  sst.include?('"Dockerfile.production"')
end
assert("infra TypeScript: web runtime environment must set PORT=3000") do
  sst.include?('PORT: "3000"')
end
assert("infra TypeScript: web command must match production Puma") do
  sst.include?('command: ["bundle", "exec", "puma", "-C", "config/puma.rb"]')
end
assert("infra TypeScript: web load balancer must forward HTTP to container port 3000") do
  sst.include?('{ listen: "80/http", forward: "3000/http" }') &&
    sst.include?('{ listen: "443/http", forward: "3000/http" }')
end
assert("infra TypeScript: web health check must target /up on port 3000") do
  sst.include?('"3000/http":') &&
    sst.include?('path: "/up"') &&
    sst.include?('curl -f http://localhost:3000/up || exit 1')
end
assert("infra TypeScript: web runtime environment must not use HTTP_PORT") do
  !sst.match?(/\bHTTP_PORT\b/)
end
assert("infra TypeScript: web runtime environment must not use TARGET_PORT") do
  !sst.match?(/\bTARGET_PORT\b/)
end
assert("infra TypeScript: SST must derive the preview host from stage identity") do
  sst.include?("const previewHost = publicHostFor(target)!")
end
assert("infra TypeScript: SST must derive preview routing from stage identity") do
  sst.include?('routePreviewHost: target.kind === "preview"') &&
    sst.include?("const routeHosts = routePreviewHost") &&
    sst.include?("[devDomain, previewHost]") &&
    sst.include?("[devDomain, devWildcardDomain]")
end
assert("infra TypeScript: Rails runtime must point ActiveStorage at the retained media bucket") do
  sst.include?('mediaBucketName: "msc-gala"') &&
    sst.include?("S3_BUCKET: mediaBucketName")
end
assert("infra TypeScript: static assets CloudFront must match the production public S3 origin") do
  sst.include?("domainName: staticAssetsBucket.domain") &&
    sst.include?("customOriginConfig") &&
    sst.include?('originProtocolPolicy: "https-only"') &&
    sst.include?('originSslProtocols: ["TLSv1.2"]') &&
    !sst.include?("new aws.cloudfront.OriginAccessControl") &&
    !sst.include?("originAccessControlId: staticAssetsOriginAccess.id")
end
assert("infra TypeScript: static assets bucket must use one SST-managed scoped public policy") do
  sst.include?('policy: [') &&
    sst.include?('principals: "*"') &&
    sst.include?('actions: ["s3:GetObject"]') &&
    sst.include?('paths: ["releases/*", "manifests/*", "assets/*"]') &&
    sst.include?('publicAccessBlock: (args: any) => {') &&
    sst.include?("args.blockPublicPolicy = false") &&
    sst.include?("args.restrictPublicBuckets = false") &&
    !sst.include?('new aws.s3.BucketPolicy("GalaStaticAssetsPublicReadPolicy"')
end
assert("infra TypeScript: ECS task roles must receive media S3 access through built-in task permissions") do
  sst.include?("const mediaAccessPermissions = [") &&
    sst.include?('actions: ["s3:ListBucket"]') &&
    sst.include?('actions: ["s3:GetObject", "s3:PutObject"]') &&
    sst.include?('permissions: mediaAccessPermissions')
end
assert("infra TypeScript: media access must not rely only on detached raw role policies") do
  !sst.include?("new aws.iam.RolePolicy(`Gala${name}MediaAccess`")
end
assert("infra TypeScript: SST must not contain nightly stage routing") do
  !sst.include?('stage === "nightly"') &&
    !sst.include?("isNightly") &&
    !sst.include?("nightly.learngala.com")
end
assert("infra TypeScript: SST must not contain nightly shared-dev runtime behavior") do
  !sst.include?("GALA_SHARED_DEV_") &&
    !sst.include?("sharedDevResourceIds") &&
    !sst.include?("useSharedDevRuntime")
end
assert("infra TypeScript: SST must not depend on GALA_NIGHTLY_DOMAIN_NAME") do
  !sst.include?("GALA_NIGHTLY_DOMAIN_NAME")
end
assert("infra TypeScript: SST must declare every retained Google OAuth secret without a fallback") do
  GOOGLE_SECRET_KEYS.all? do |key|
    sst.match?(/^\s*#{key}: new sst\.Secret\("#{key}"\),$/)
  end
end
assert("infra TypeScript: retained Google OAuth secrets must project through deterministic SecureString names") do
  GOOGLE_SECRET_KEYS.all? do |key|
    sst.match?(%r{\[\s*"#{key}",\s*secretValueToParameter\(\s*"#{key}",\s*resolveSecret\("#{key}"\),?\s*\),?\s*\]}m)
  end &&
    sst.match?(%r{const secretValueToParameter = .*?type: "SecureString"}m) &&
    sst.include?("const useDeterministicName = GOOGLE_SECRET_KEYS.some") &&
    sst.include?("valueFrom: useDeterministicName ? parameterName : parameter.arn") &&
    !sst.match?(%r{new aws\.ssm\.Parameter\(.*?\)\.arn}m)
end
assert("infra TypeScript: all four Google parameters must be explicit task-definition dependencies") do
  sst.include?("const googleSecretParameterDependencies = GOOGLE_SECRET_KEYS.map") &&
    sst.include?("sharedSecretParameters[key].parameter") &&
    sst.include?("opts.dependsOn = [") &&
    sst.include?("...googleSecretParameterDependencies")
end
assert("infra TypeScript: every Rails Fargate consumer must inherit the task-definition dependency transform") do
  sst.match?(%r{const railsTaskDefaults = \{.*?transform: \{\s*taskDefinition: taskDefinitionSecretDependencyTransform,\s*\}.*?\};}m) &&
    RAILS_TASK_DEFINITION_NAMES.all? { |name| sst.include?("\"#{name}\"") }
end
assert("infra TypeScript: bastion AMIs must be pinned to the approved running images") do
  APPROVED_BASTION_AMIS.values.all? { |ami| sst.include?(ami) } &&
    sst.include?("bastionInstance: (args: any) =>") &&
    sst.include?("args.ami = bastionAmi")
end
assert("infra TypeScript: both Rails services must inherit the shared secret map") do
  sst.match?(%r{const railsTaskDefaults = \{.*?ssm: railsRuntimeSecrets,.*?\};}m) &&
    sst.match?(%r{const railsServiceDefaults = \{\s*\.\.\.railsTaskDefaults,}m) &&
    %w[GalaWeb GalaWorker].all? do |service|
      sst.match?(%r{new sst\.aws\.Service\("#{service}", \{\s*\.\.\.railsServiceDefaults,}m)
    end
end
assert("infra TypeScript: every Rails task must inherit the shared secret map") do
  %w[GalaMigrate GalaSeedDatabase GalaRefreshIndices GalaWeeklyReport].all? do |task|
    sst.match?(%r{new sst\.aws\.Task\("#{task}", \{\s*\.\.\.railsTaskDefaults,}m)
  end
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
assert("scripts/deploy-sst.sh: routine releases must use the rapid dispatcher") do
  deploy_script.include?('rapid_release_main "$STAGE" "$USER_DATA"')
end
assert("scripts/deploy-sst.sh: routine releases must not invoke SST") do
  !deploy_script.match?(/sst (install|deploy|refresh)/)
end
assert("scripts/deploy-sst.sh: deploy wrapper must reject nightly stage") do
  deploy_script.include?('if [[ "$STAGE" != dev && "$STAGE" != production ]]; then') &&
    deploy_script.include?("Stage must be dev or production")
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
