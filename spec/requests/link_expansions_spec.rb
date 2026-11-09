# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Edgenote link expansions' do
  let(:kase) { create :case_with_edgenotes }
  let(:saved_url) { 'https://www.nytimes.com/2018/08/04/world/europe/europe-heat-wave.html' }
  let(:edgenote) do
    kase.edgenotes.first.tap { |edgenote| edgenote.update! website_url: saved_url }
  end
  let(:other_url) { 'https://example.com/unsaved-link' }
  let(:open_graph) do
    instance_double OpenGraph, title: 'Title', type: 'article', url: saved_url,
                               description: 'Description', images: []
  end

  before do
    allow_any_instance_of(ApplicationController)
      .to receive(:verified_request?).and_return(true)
    allow(OpenGraph).to receive(:new).and_return(open_graph)
    allow(OEmbed::Providers).to receive(:get).and_raise(OEmbed::NotFound)
  end

  def expand(href)
    get "/edgenotes/#{edgenote.slug}/link_expansion.json", params: { href: href }
  end

  describe 'GET /edgenotes/:slug/link_expansion' do
    it 'expands the saved link for anyone' do
      expand saved_url

      expect(response).to have_http_status(:ok)
      expect(OpenGraph).to have_received(:new).with(saved_url)
    end

    it 'expands the saved link instead of a different one for a non-editor' do
      sign_in create(:reader)

      expand other_url

      expect(response).to have_http_status(:ok)
      expect(OpenGraph).to have_received(:new).with(saved_url)
      expect(OpenGraph).not_to have_received(:new).with(other_url)
    end

    it 'expands the saved link instead of a different one when signed out' do
      expand other_url

      expect(OpenGraph).to have_received(:new).with(saved_url)
      expect(OpenGraph).not_to have_received(:new).with(other_url)
    end

    context 'when signed in as an editor of the case' do
      before do
        reader = create :reader
        reader.my_cases << kase
        sign_in reader
      end

      it 'expands the unsaved link being typed' do
        expand other_url

        expect(OpenGraph).to have_received(:new).with(other_url)
      end

      it 'refuses a link that is not http or https' do
        expand 'file:///etc/passwd'

        expect(OpenGraph).to have_received(:new).with(saved_url)
      end
    end

    it 'returns 404 for an edgenote that does not exist' do
      get '/edgenotes/imaginary-edgenote/link_expansion.json',
          params: { href: other_url }

      expect(response).to have_http_status(:not_found)
      expect(OpenGraph).not_to have_received(:new)
    end

    it 'returns 404 when the edgenote has no link' do
      edgenote.update! website_url: nil

      expand nil

      expect(response).to have_http_status(:not_found)
    end

    it 'falls back to the bare link when the page is too slow' do
      allow(OpenGraph).to receive(:new).and_raise(Timeout::Error)

      expand saved_url

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['preview']).to include(
        'title' => saved_url, 'url' => saved_url, 'images' => []
      )
    end

    it 'does not log a link that has no embed provider' do
      allow(Rails.logger).to receive(:warn)

      expand saved_url

      expect(Rails.logger).not_to have_received(:warn)
        .with(/Link expansion embed failed/)
    end
  end

  describe 'PATCH /edgenotes/:slug/link_expansion' do
    def hide_image
      patch "/edgenotes/#{edgenote.slug}/link_expansion.json",
            params: { visibility: { no_image: true } }
    end

    it 'refuses a reader who cannot edit the case' do
      sign_in create(:reader)

      hide_image

      expect(response).to have_http_status(:forbidden)
      expect(edgenote.reload.link_expansion_visibility).to be_nil
    end

    it 'lets an editor of the case change what the expansion shows' do
      reader = create :reader
      reader.my_cases << kase
      sign_in reader

      hide_image

      expect(response).to have_http_status(:ok)
      expect(edgenote.reload.link_expansion_visibility.no_image).to be true
    end
  end

  describe 'request logging' do
    it 'leaves the link out of the log line' do
      event = instance_double(
        ActiveSupport::Notifications::Event,
        payload: {
          controller: 'Edgenotes::LinkExpansionsController',
          params: { 'controller' => 'x', 'href' => saved_url,
                    'updatedAt' => '2023-11-27T15:06:48.382Z',
                    'edgenote_slug' => edgenote.slug }
        }
      )

      logged = Rails.application.config.lograge.custom_options.call(event)

      expect(logged[:params]).to eq('edgenote_slug' => edgenote.slug)
    end
  end
end
