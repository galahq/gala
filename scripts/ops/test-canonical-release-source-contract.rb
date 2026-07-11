#!/usr/bin/env ruby

root = File.expand_path('../..', __dir__)
runtime = File.read(File.join(root, 'infra/runtime.ts'))
config = File.read(File.join(root, 'infra/config.ts'))
workflow = File.read(File.join(root, '.github/workflows/deploy.yml'))
rails_release_sources = %w[
  app/helpers/application_helper.rb
  config/application.rb
  config/initializers/sentry.rb
].map { |path| File.read(File.join(root, path)) }.join("\n")

failures = []
legacy = %w[GALA_RELEASE_ID GALA_ASSET_PREFIX GALA_RELEASE_VERSION GALA_APP_IMAGE_URI GALA_WEB_IMAGE_URI]
legacy.each do |name|
  failures << "infra runtime still reads #{name}" if runtime.include?(name)
  failures << "infra config still reads #{name}" if config.include?(name)
end
failures << 'runtime must expose canonical GALA_RELEASE' unless runtime.include?('GALA_RELEASE:')
failures << 'workflow must not expose container architecture input' if workflow.include?('GALA_CONTAINER_ARCHITECTURE')
failures << 'workflow must not expose Dockerfile input' if workflow.include?('GALA_PRODUCTION_DOCKERFILE')
%w[GALA_RELEASE_VERSION GALA_RELEASE_ID RELEASE_URL GALA_RELEASE_URL].each do |name|
  failures << "Rails still reads #{name}" if rails_release_sources.include?(name)
end
failures << 'Sentry must use canonical GALA_RELEASE' unless rails_release_sources.include?("config.release = ENV['GALA_RELEASE']")

abort failures.join("\n") unless failures.empty?
puts 'PASS canonical release source contract'
