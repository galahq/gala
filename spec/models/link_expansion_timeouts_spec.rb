# frozen_string_literal: true

require 'rails_helper'
require 'socket'

# Runs the real gems against a local server that accepts connections and never
# answers, so the fetch timeouts are exercised rather than stubbed
RSpec.describe 'Link expansion fetch timeouts' do
  let(:visibility) { LinkExpansion::DefaultVisibility.instance }

  around do |example|
    server = TCPServer.new '127.0.0.1', 0
    clients = []
    acceptor = Thread.new { loop { clients << server.accept } }
    @base = "http://127.0.0.1:#{server.addr[1]}"
    example.run
  ensure
    acceptor&.kill
    clients&.each(&:close)
    server&.close
  end

  def elapsed
    started = Process.clock_gettime Process::CLOCK_MONOTONIC
    yield
    Process.clock_gettime(Process::CLOCK_MONOTONIC) - started
  end

  describe LinkExpansion::Preview do
    before { stub_const 'LinkExpansion::Preview::FETCH_TIMEOUT', 1 }

    it 'gives up on a page that never answers and shows the bare link' do
      url = "#{@base}/article"
      preview = nil

      seconds = elapsed { preview = described_class.for url, with_visibility: visibility }

      expect(seconds).to be < 3
      expect(preview.as_json(nil)).to include title: url, images: []
    end
  end

  describe LinkExpansion::Embed do
    let(:provider) do
      OEmbed::Provider.new("#{@base}/oembed").tap { |p| p << 'http://slow.example/*' }
    end

    before do
      stub_const 'LinkExpansion::Embed::FETCH_TIMEOUT', 1
      OEmbed::Providers.register provider
    end

    after { OEmbed::Providers.unregister provider }

    it 'gives up on an embed provider that never answers' do
      allow(Rails.logger).to receive(:warn)
      embed = nil

      seconds = elapsed do
        embed = described_class.for 'http://slow.example/video', with_visibility: visibility
      end

      expect(seconds).to be < 3
      expect(embed).to eq({})
      expect(Rails.logger).to have_received(:warn).with(/Timeout::Error/)
    end
  end
end
