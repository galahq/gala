# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LinkExpansion do
  let(:visibility) { LinkExpansion::DefaultVisibility.instance }
  let(:github_pages_url) { 'https://example.github.io/my-github-pages-doc.html' }
  let(:regular_url) { 'https://example.com/regular-page.html' }

  describe '#initialize' do
    it 'uses GithubPagesEmbed for trusted domains' do
      allow(LinkExpansion::GithubPagesEmbed).to receive(:new).and_return(
        double('github_pages_embed', trusted_domain?: true)
      )
      allow(LinkExpansion::GithubPagesEmbed).to receive(:for).and_return({ __html: '<iframe></iframe>' })

      link_expansion = LinkExpansion.new(github_pages_url, visibility)
      
      expect(LinkExpansion::GithubPagesEmbed).to have_received(:for).with(github_pages_url, with_visibility: visibility)
    end

    it 'uses regular Embed for non-trusted domains' do
      allow(LinkExpansion::GithubPagesEmbed).to receive(:new).and_return(
        double('github_pages_embed', trusted_domain?: false)
      )
      allow(LinkExpansion::Embed).to receive(:for).and_return({ __html: '<div></div>' })

      link_expansion = LinkExpansion.new(regular_url, visibility)
      
      expect(LinkExpansion::Embed).to have_received(:for).with(regular_url, with_visibility: visibility)
    end
  end
end

