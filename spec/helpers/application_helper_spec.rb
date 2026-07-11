# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationHelper, type: :helper do
  RELEASE_ENV_KEYS = %w[
    GALA_RELEASE
    GITHUB_REPOSITORY
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
    it 'links canonical releases to the deploy workflow' do
      ENV['GITHUB_REPOSITORY'] = 'galahq/gala'
      ENV['SST_STAGE'] = 'dev'
      ENV['GALA_RELEASE'] = 'v412'

      expect(helper.gala_release_label).to eq('dev v412')
      expect(helper.gala_release_url).to eq('https://github.com/galahq/gala/actions/workflows/deploy.yml')
    end

    it 'derives preview identity from the SST stage' do
      ENV['GITHUB_REPOSITORY'] = 'galahq/gala'
      ENV['SST_STAGE'] = 'pr-785'
      ENV['GALA_RELEASE'] = 'v412'

      expect(helper.gala_release_label).to eq('pr-785 v412')
      expect(helper.gala_release_url).to eq('https://github.com/galahq/gala/pull/785')
    end
  end
end
