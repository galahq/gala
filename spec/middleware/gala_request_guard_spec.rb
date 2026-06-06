# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GalaRequestGuard do
  let(:dummy_app) do
    ->(_env) { [200, { 'Content-Type' => 'text/plain' }, ['OK']] }
  end

  def request_for(path, ip: '1.2.3.4')
    Rack::Request.new(Rack::MockRequest.env_for(path, 'REMOTE_ADDR' => ip))
  end

  def middleware(**options)
    described_class.new(dummy_app, **options)
  end

  describe 'invalid case URL depth predicate' do
    it 'blocks case URLs with multiple numeric depth segments' do
      guard = middleware(logger: -> { instance_double(Logger, warn: nil) })

      match = guard.send(:invalid_case_url_depth?,
                         request_for('/cases/sample-case/1/2'))

      expect(match).to be(true)
    end

    it 'allows valid case page requests with a single numeric segment' do
      match = middleware.send(:invalid_case_url_depth?,
                              request_for('/cases/sample-case/1'))

      expect(match).to be(false)
    end

    it 'ignores non-case paths entirely' do
      match = middleware.send(:invalid_case_url_depth?,
                              request_for('/readings/sample-case/1/2'))

      expect(match).to be(false)
    end
  end

  describe 'middleware integration' do
    it 'returns a 404 response for malformed case URLs' do
      status, _headers, body =
        middleware(logger: -> { instance_double(Logger, warn: nil) })
        .call(Rack::MockRequest.env_for('/cases/bot-target/1/2/3'))

      expect(status).to eq(404)
      expect(body.join).to eq("Not Found\n")
    end

    it 'passes through to the app for valid requests' do
      status, _headers, body =
        middleware.call(Rack::MockRequest.env_for('/cases/bot-target/1'))

      expect(status).to eq(200)
      expect(body.join).to eq('OK')
    end

    it 'returns a 429 response after the per-IP request limit' do
      cache = ActiveSupport::Cache::MemoryStore.new
      guard = middleware(cache: -> { cache }, limit: 1, period: 60)

      guard.call(Rack::MockRequest.env_for('/cases/bot-target/1',
                                           'REMOTE_ADDR' => '1.2.3.4'))
      status, _headers, body =
        guard.call(Rack::MockRequest.env_for('/cases/bot-target/1',
                                             'REMOTE_ADDR' => '1.2.3.4'))

      expect(status).to eq(429)
      expect(body.join).to eq("Retry later\n")
    end
  end
end
