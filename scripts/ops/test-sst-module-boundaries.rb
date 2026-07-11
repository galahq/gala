#!/usr/bin/env ruby
# frozen_string_literal: true

ROOT = File.expand_path("../..", __dir__)

def read(path)
  File.read(File.join(ROOT, path))
end

def assert(message)
  raise message unless yield
end

dispatcher = read("infra/sst.config.ts")
config = read("infra/config.ts")
assets = read("infra/assets.ts")
platform = read("infra/platform.ts")
runtime = read("infra/runtime.ts")
stages = Dir.glob(File.join(ROOT, "infra/stages/*.ts")).sort.map { |path| File.read(path) }.join("\n")

assert("sst.config.ts must remain under 35 lines") { dispatcher.lines.length < 35 }
assert("sst.config.ts must not construct resources") { !dispatcher.match?(/new\s+(?:sst|aws)\./) }
assert("resource modules must not construct resources at import time") do
  [assets, platform, runtime].all? do |source|
    first_constructor = source.index(/new\s+(?:sst|aws)\./)
    function_start = source.index(/export function create/)
    first_constructor && function_start && first_constructor > function_start
  end
end
assert("stable configuration and platform modules must not read deploy environment") do
  [dispatcher, config, assets, platform, stages].none? do |source|
    source.include?("process.env")
  end
end
legacy_runtime_keys = runtime.scan(/process\.env\.([A-Z0-9_]+)/).flatten.uniq.sort
assert("runtime may read only provider credentials") do
  legacy_runtime_keys == %w[CLOUDFLARE_ZONE_ID]
end
assert("fixed platform facts must not be deploy environment reads") do
  forbidden = %w[
    GALA_CONTAINER_ARCHITECTURE
    GALA_DOMAIN_NAME
    GALA_ENABLE_CUSTOM_DOMAIN
    GALA_CLOUDFLARE_PROXY
    GALA_IMPORT_STATIC_ASSETS_BUCKET
    GALA_PRODUCTION_DOCKERFILE
    GALA_STATIC_ASSETS_BUCKET
  ]
  forbidden.none? { |name| runtime.include?("process.env.#{name}") }
end
assert("asset resources must have one owner") do
  assets.scan(/new sst\.aws\.Bucket\("GalaStaticAssets"/).length == 1 &&
    assets.scan(/new aws\.cloudfront\.Distribution\(\s*"GalaStaticAssetsDistribution"/).length == 1
end
assert("platform resources must have one owner") do
  %w[GalaVpc GalaCluster GalaDatabase GalaCache].all? do |name|
    platform.scan(/"#{name}"/).length == 1
  end
end
assert("runtime services and tasks must have one owner") do
  %w[GalaWeb GalaWorker GalaMigrate GalaSeedDatabase GalaRefreshIndices GalaWeeklyReport].all? do |name|
    runtime.scan(/new sst\.aws\.(?:Service|Task)\("#{name}"/).length == 1
  end
end

puts "PASS sst module boundaries"
