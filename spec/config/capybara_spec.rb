# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Capybara test server' do
  it 'uses loopback when the browser runs on the same host' do
    skip 'the Docker Selenium browser needs the container network address' if File.file?('/.dockerenv')

    expect(Capybara.server_host).to eq('127.0.0.1')
  end
end
