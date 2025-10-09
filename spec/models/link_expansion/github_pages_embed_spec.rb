# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LinkExpansion::GithubPagesEmbed do
  let(:visibility) { LinkExpansion::DefaultVisibility.instance }
  let(:trusted_github_url) { 'https://ocelots-rcn.github.io/some-page.html' }
  let(:untrusted_github_url) { 'https://other-user.github.io/some-page.html' }
  let(:non_github_url) { 'https://example.com/regular-page.html' }
  let(:invalid_url) { 'not-a-url' }

  describe '#trusted_domain?' do
    it 'returns true for trusted GitHub Pages domains' do
      embed = described_class.new(trusted_github_url, visibility)
      expect(embed.trusted_domain?).to be true
    end


    it 'returns false for untrusted GitHub Pages domains' do
      embed = described_class.new(untrusted_github_url, visibility)
      expect(embed.trusted_domain?).to be false
    end

    it 'returns false for non-GitHub domains' do
      embed = described_class.new(non_github_url, visibility)
      expect(embed.trusted_domain?).to be false
    end

    it 'returns false for invalid URLs' do
      embed = described_class.new(invalid_url, visibility)
      expect(embed.trusted_domain?).to be false
    end

    it 'returns false for blank URLs' do
      embed = described_class.new('', visibility)
      expect(embed.trusted_domain?).to be false
    end
  end

  describe '#as_json' do
    it 'returns iframe HTML for trusted domains' do
      embed = described_class.new(trusted_github_url, visibility)
      result = embed.as_json(nil)
      
      expect(result).to have_key(:__html)
      expect(result[:__html]).to include('<iframe')
      expect(result[:__html]).to include('github_pages')
      expect(result[:__html]).to include('sandbox=')
    end

    it 'returns nil for untrusted domains' do
      embed = described_class.new(untrusted_github_url, visibility)
      result = embed.as_json(nil)
      
      expect(result).to be_nil
    end

    it 'returns nil when visibility disables embeds' do
      visibility = double('visibility', no_embed: true)
      embed = described_class.new(trusted_github_url, visibility)
      result = embed.as_json(nil)
      
      expect(result).to be_nil
    end
  end

  describe '.for' do
    it 'handles errors gracefully' do
      allow(described_class).to receive(:new).and_raise(StandardError, 'Test error')
      
      result = described_class.for(trusted_github_url, with_visibility: visibility)
      expect(result).to eq({})
    end
  end
end
