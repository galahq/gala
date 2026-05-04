# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Shakapacker dev server configuration' do
  subject(:dev_server_config) do
    YAML.safe_load_file(
      Rails.root.join('config/shakapacker.yml'),
      aliases: true
    ).fetch('development').fetch('dev_server')
  end

  it 'allows browser containers to reach webpack HMR through the Docker host gateway' do
    expect(dev_server_config.fetch('host')).to eq('0.0.0.0')
    expect(dev_server_config.fetch('allowed_hosts')).to include(
      'localhost',
      'host.docker.internal'
    )
  end
end
