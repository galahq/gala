#!/usr/bin/env ruby

workflow = File.read(File.expand_path('../../.github/workflows/deploy.yml', __dir__))
failures = []

failures << 'workflow must stay under 190 lines' if workflow.lines.length >= 190
failures << 'workflow must pass GITHUB_RUN_NUMBER' unless workflow.include?('GITHUB_RUN_NUMBER: ${{ github.run_number }}')
failures << 'workflow must enable rapid releases' unless workflow.include?('GALA_RAPID_RELEASE: "true"')
failures << 'workflow must use ARM runner' unless workflow.include?('runs-on: ubuntu-24.04-arm')
failures << 'workflow must call deploy-sst.sh exactly once' unless workflow.scan(/scripts\/deploy-sst\.sh/).length == 1
failures << 'workflow must not install SST' if workflow.match?(/sst install/)
failures << 'workflow must not mutate media CORS' if workflow.include?('sync-media-bucket-cors.sh')
failures << 'workflow must not create release IDs' if workflow.match?(/GALA_RELEASE_ID|release_id=/)
failures << 'workflow must not configure architecture dynamically' if workflow.include?('GALA_CONTAINER_ARCHITECTURE')
failures << 'production must use an environment gate' unless workflow.include?('environment: ${{ inputs.stage == \'production\' && \'production\' || \'dev\' }}')
failures << 'preview URL must use exact PR number' unless workflow.include?('https://pr-${pr_number}.dev.learngala.dev')

abort failures.join("\n") unless failures.empty?
puts 'PASS deploy workflow contract'
