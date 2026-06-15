# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationHelper, type: :helper do
  RELEASE_ENV_KEYS = %w[
    GALA_PREVIEW_PR_NUMBER
    GALA_RELEASE_URL
    GALA_RELEASE_VERSION
    GITHUB_REPOSITORY
    RELEASE
    RELEASE_URL
    SST_STAGE
  ].freeze

  around do |example|
    previous_env = ENV.to_hash
    RELEASE_ENV_KEYS.each { |key| ENV.delete(key) }
    example.run
  ensure
    ENV.replace(previous_env)
  end

  describe '#gala_release_url' do
    it 'uses the deploy-provided release URL when present' do
      ENV['GITHUB_REPOSITORY'] = 'galahq/gala'
      ENV['SST_STAGE'] = 'dev'
      ENV['RELEASE_URL'] = 'https://github.com/galahq/gala/tree/latest'

      expect(helper.gala_release_url).to eq('https://github.com/galahq/gala/tree/latest')
    end

    it 'links stage releases to the moving latest ref instead of GitHub releases latest' do
      ENV['GITHUB_REPOSITORY'] = 'galahq/gala'
      ENV['SST_STAGE'] = 'dev'
      ENV['GALA_RELEASE_VERSION'] = 'v2.9.9'

      expect(helper.gala_release_label).to eq('dev v2.9.9')
      expect(helper.gala_release_url).to eq('https://github.com/galahq/gala/tree/latest')
    end

    it 'links non-stage previews back to the pull request' do
      ENV['GITHUB_REPOSITORY'] = 'galahq/gala'
      ENV['GALA_PREVIEW_PR_NUMBER'] = '785'

      expect(helper.gala_release_url).to eq('https://github.com/galahq/gala/pull/785')
    end
  end
end
