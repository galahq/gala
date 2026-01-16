# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Rack::Attack invalid case URL blocklist' do
  before do
    Rack::Attack.enabled = true
  end

  def request_for(path, ip: '1.2.3.4')
    env = Rack::MockRequest.env_for(path, 'REMOTE_ADDR' => ip)
    Rack::Attack::Request.new(env)
  end

  def blocklist
    Rack::Attack.blocklists['invalid-case-url-depth']
  end

  describe 'blocklist predicate' do
    it 'blocks case URLs with multiple numeric depth segments' do
      match = blocklist.matched_by?(request_for('/cases/sample-case/1/2'))
      expect(match).to be_truthy
    end

    it 'allows valid case page requests with a single numeric segment' do
      match = blocklist.matched_by?(request_for('/cases/sample-case/1'))
      expect(match).to be_falsey
    end

    it 'ignores non-case paths entirely' do
      match = blocklist.matched_by?(request_for('/readings/sample-case/1/2'))
      expect(match).to be_falsey
    end
  end

  describe 'middleware integration' do
    let(:dummy_app) do
      ->(_env) { [200, { 'Content-Type' => 'text/plain' }, ['OK']] }
    end

    let(:middleware) { Rack::Attack.new(dummy_app) }

    it 'returns a 404 response for malformed case URLs' do
      status, _headers, body =
        middleware.call(Rack::MockRequest.env_for('/cases/bot-target/1/2/3'))

      expect(status).to eq(404)
      expect(body.join).to eq("Not Found\n")
    end

    it 'passes through to the app for valid requests' do
      status, _headers, body =
        middleware.call(Rack::MockRequest.env_for('/cases/bot-target/1'))

      expect(status).to eq(200)
      expect(body.join).to eq('OK')
    end
  end
end
