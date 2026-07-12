#!/usr/bin/env ruby
# frozen_string_literal: true

ROOT = File.expand_path("../..", __dir__)
INFRA = File.join(ROOT, "infra")

def assert(message)
  raise message unless yield
end

paths = Dir.glob(File.join(INFRA, "**/*.ts")).reject do |path|
  path.include?("/.sst/") || path.include?("/node_modules/") ||
    path.include?("/test/") || path.end_with?("sst-env.d.ts")
end.sort
sources = paths.to_h { |path| [path.delete_prefix("#{INFRA}/"), File.read(path)] }
aggregate = sources.values.join("\n")

assert("stage parsing must recognize exactly the four approved forms") do
  config = sources.fetch("config.ts")
  config.include?('stage === "dev"') &&
    config.include?('stage === "production"') &&
    config.include?('/^pr-([1-9][0-9]*)$/') &&
    config.include?('/^local-([a-z0-9][a-z0-9-]{0,31})$/') &&
    config.include?("unsupported SST stage")
end

assert("durable stages must stay protected and retained") do
  config = sources.fetch("config.ts")
  config.include?('protect: true, removal: "retain-all"') &&
    config.include?('protect: false, removal: "remove"')
end

assert("durable stage composition order must remain assets, platform, runtime") do
  %w[dev production].all? do |stage|
    source = sources.fetch("stages/#{stage}.ts")
    assets = source.index("createAssets(context)")
    platform = source.index("createPlatform(context)")
    runtime = source.index("createDurableRuntime(context, platform, assets)")
    assets && platform && runtime && assets < platform && platform < runtime
  end
end

durable_source = [
  sources.fetch("assets.ts"),
  sources.fetch("platform.ts"),
  sources.fetch("runtime/durable.ts"),
].join("\n")
logical_names = %w[
  GalaVpc GalaCluster GalaDatabase GalaCache GalaStaticAssets
  GalaStaticAssetsDistribution GalaWeb GalaWorker GalaMigrate
  GalaSeedDatabase GalaRefreshIndices GalaWeeklyReport
]
logical_names.each do |name|
  assert("#{name} must occur exactly once as a durable logical name") do
    durable_source.scan(/(?:new\s+[A-Za-z0-9_.]+|\.get)\(\s*["']#{Regexp.escape(name)}["']/).length == 1
  end
end

assert("media storage must remain a reference rather than an SST-owned bucket") do
  aggregate.include?('aws.s3.BucketV2.get("GalaMediaBucket", mediaBucketName)') &&
    !aggregate.match?(/new\s+(?:sst\.aws\.Bucket|aws\.s3\.BucketV2)\(\s*["']GalaMediaBucket["']/)
end

assert("SES must remain externally owned") do
  !aggregate.match?(/new\s+(?:sst\.aws\.(?:Email|Ses)|aws\.ses)/i)
end

required_stage_files = %w[
  dev-reference.ts
  runtime/durable.ts
  runtime/derived.ts
  stages/preview.ts
  stages/local.ts
  stages/dispatch.ts
]
assert("preview and local composition must have explicit modules") do
  required_stage_files.all? { |path| sources.key?(path) }
end

if required_stage_files.all? { |path| sources.key?(path) }
  reference = sources.fetch("dev-reference.ts")
  derived = sources.fetch("runtime/derived.ts")
  facade = sources.fetch("runtime.ts")
  dispatcher = sources.fetch("stages/index.ts")

  assert("dev references must not construct durable resources") do
    !reference.match?(/new\s+(?:sst|aws)\./) &&
      reference.include?("sst.aws.Cluster.get") &&
      reference.include?("sst.aws.Router.get") &&
      reference.include?("aws.cloudfront.Distribution.get")
  end

  assert("runtime facade must remain constructor-free") do
    !facade.match?(/new\s+(?:sst|aws)\./)
  end

  assert("derived runtime must consume dev SSM names") do
    reference.include?('parameter/gala/dev/${name}') &&
      derived.include?("ssm: dev.ssm") &&
      !derived.match?(/new\s+(?:sst\.aws\.(?:Vpc|Postgres|Redis|Bucket|Router|Cron)|aws\.(?:rds|elasticache|s3|cloudfront|ses|ssm))/i)
  end

  assert("derived services must have stage-qualified physical names") do
    derived.include?('`gala-${stage}-web`') &&
      derived.include?('`gala-${stage}-worker`')
  end

  assert("stage dispatcher must cover every supported kind") do
    dispatcher.include?("runStageWith") &&
      %w[runDev runProduction runPreview runLocal].all? { |name| dispatcher.include?(name) }
  end
end

puts "PASS sst stage boundaries"
