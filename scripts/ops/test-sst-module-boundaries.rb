#!/usr/bin/env ruby
# frozen_string_literal: true

ROOT = File.expand_path("../..", __dir__)
INFRA = File.join(ROOT, "infra")

def assert(message)
  raise message unless yield
end

paths = Dir.glob(File.join(INFRA, "**/*.ts")).reject do |path|
  path.include?("/.sst/") || path.include?("/node_modules/") || path.include?("/test/") || path.end_with?("sst-env.d.ts")
end.sort
relative = paths.to_h { |path| [path.delete_prefix("#{INFRA}/"), File.read(path)] }
aggregate = relative.values.join("\n")

def imports_for(path, source, known)
  source.scan(/(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["'](\.[^"']+)["']/).flatten.filter_map do |spec|
    base = File.expand_path(spec, File.dirname(path))
    candidates = ["#{base}.ts", File.join(base, "index.ts")]
    found = candidates.find { |candidate| known.include?(candidate) }
    found
  end.uniq
end

graph = paths.to_h { |path| [path, imports_for(path, File.read(path), paths)] }
visiting = {}
visited = {}
visit = lambda do |node|
  raise "infra TypeScript import graph must be acyclic at #{node.delete_prefix("#{INFRA}/")}" if visiting[node]
  return if visited[node]

  visiting[node] = true
  graph.fetch(node).each { |child| visit.call(child) }
  visiting.delete(node)
  visited[node] = true
end
paths.each { |path| visit.call(path) }

runtime_facade = File.join(INFRA, "runtime.ts")
runtime_modules = graph.fetch(runtime_facade).select { |path| path.start_with?(File.join(INFRA, "runtime/")) }
if runtime_modules.any?
  facade = File.read(runtime_facade)
  assert("runtime facade must not construct resources") { !facade.match?(/new\s+(?:sst|aws)\./) }
  assert("runtime implementation modules must not import the facade") do
    runtime_modules.none? { |path| graph.fetch(path).include?(runtime_facade) }
  end
end

assert("SES resources are externally owned and must never be constructed") do
  !aggregate.match?(/new\s+(?:sst\.aws\.(?:Email|Ses)|aws\.ses)/i)
end

durable_source = %w[assets.ts platform.ts runtime/durable.ts]
  .map { |path| relative.fetch(path) }
  .join("\n")
logical_names = %w[
  GalaVpc GalaCluster GalaDatabase GalaCache GalaStaticAssets
  GalaStaticAssetsDistribution GalaWeb GalaWorker GalaMigrate
  GalaSeedDatabase GalaRefreshIndices GalaWeeklyReport
]
logical_names.each do |name|
  assert("#{name} must occur exactly once as a resource logical name") do
    durable_source.scan(/(?:new\s+[A-Za-z0-9_.]+|\.get)\(\s*["']#{Regexp.escape(name)}["']/).length == 1
  end
end

derived_source = relative.fetch("runtime/derived.ts")
%w[GalaWeb GalaWorker GalaMigrate GalaSeedDatabase GalaRefreshIndices GalaWeeklyReport].each do |name|
  assert("#{name} must occur once in derived app compute") do
    derived_source.scan(/(?:new\s+[A-Za-z0-9_.]+|task)\(\s*["']#{Regexp.escape(name)}["']/).length == 1
  end
end

puts "PASS sst module boundaries"
