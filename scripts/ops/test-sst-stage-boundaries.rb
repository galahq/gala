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
    runtime = source.index("createRuntime(context, platform, assets)")
    assets && platform && runtime && assets < platform && platform < runtime
  end
end

logical_names = %w[
  GalaVpc GalaCluster GalaDatabase GalaCache GalaStaticAssets
  GalaStaticAssetsDistribution GalaWeb GalaWorker GalaMigrate
  GalaSeedDatabase GalaRefreshIndices GalaWeeklyReport
]
logical_names.each do |name|
  assert("#{name} must occur exactly once as a durable logical name") do
    aggregate.scan(/(?:new\s+[A-Za-z0-9_.]+|\.get)\(\s*["']#{Regexp.escape(name)}["']/).length == 1
  end
end

assert("media storage must remain a reference rather than an SST-owned bucket") do
  aggregate.include?('aws.s3.BucketV2.get("GalaMediaBucket", mediaBucketName)') &&
    !aggregate.match?(/new\s+(?:sst\.aws\.Bucket|aws\.s3\.BucketV2)\(\s*["']GalaMediaBucket["']/)
end

assert("SES must remain externally owned") do
  !aggregate.match?(/new\s+(?:sst\.aws\.(?:Email|Ses)|aws\.ses)/i)
end

puts "PASS sst stage boundaries"
