#!/usr/bin/env ruby

workflow = File.read(File.expand_path('../../.github/workflows/deploy.yml', __dir__))
deploy = File.read(File.expand_path('../deploy-sst.sh', __dir__))
target = File.expand_path('../lib/stage-target.sh', __dir__)
target_source = File.exist?(target) ? File.read(target) : ''
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
failures << 'preview URL must use exact PR number' unless target_source.include?('https://%s.dev.learngala.dev')
failures << 'workflow must use the canonical target resolver' unless workflow.include?('source scripts/lib/stage-target.sh')
failures << 'deploy must validate the effective stage' unless deploy.include?('validate_effective_stage "$STAGE" "${GALA_EFFECTIVE_STAGE:-$STAGE}"')

unless File.exist?(target)
  failures << 'canonical target resolver is missing'
else
  fixtures = {
    ['dev', '790'] => ['pr-790', 'https://pr-790.dev.learngala.dev'],
    ['production', '790'] => ['production', 'https://learngala.dev'],
    ['dev', ''] => ['dev', 'https://dev.learngala.dev'],
    ['dev', 'closed'] => ['dev', 'https://dev.learngala.dev'],
  }
  fixtures.each do |(stage, pr), expected|
    command = ['bash', '-c', 'source "$1"; effective="$(effective_stage_for "$2" "$3")"; printf "%s\n%s" "$effective" "$(public_url_for "$effective")"', 'test', target, stage, pr]
    output = IO.popen(command, &:read).split("\n")
    failures << "#{stage}/#{pr.inspect} resolved to #{output.inspect}" unless output == expected
  end

  invalid = %w[local-nathan pr-0 production]
  invalid.each do |effective|
    system('bash', '-c', 'source "$1"; validate_effective_stage dev "$2"', 'test', target, effective, out: File::NULL, err: File::NULL)
    failures << "dev must reject effective stage #{effective}" if $?.success?
  end
end

abort failures.join("\n") unless failures.empty?
puts 'PASS deploy workflow contract'
