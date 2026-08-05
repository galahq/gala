# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Public utility routes', type: :request do
  describe 'error pages' do
    {
      '/403' => :forbidden,
      '/404' => :not_found,
      '/422' => :unprocessable_entity,
      '/500' => :internal_server_error
    }.each do |path, status|
      # These pages are static HAML with no React, so the Blueprint classes are
      # written by hand and are easy to break silently. `pt-`/`bp4-` were the
      # runtime-shim namespaces, retired in the React 19 / Blueprint 6 upgrade —
      # see the note in app/helpers/blueprint_form_builder.rb.
      it "renders #{path} with static Blueprint 6 classes" do
        get path

        expect(response).to have_http_status(status)

        document = Nokogiri::HTML.parse(response.body)
        expect(document.css('.bp6-non-ideal-state')).to be_present
        expect(document.css('.bp6-non-ideal-state-visual')).to be_present
        # BP6 dropped the dedicated -title/-description classes; the heading is
        # a plain h4.bp6-heading and the body copy carries no class.
        expect(document.css('h4.bp6-heading')).to be_present
      end
    end

    it 'renders the 404 search form with static Blueprint 6 classes' do
      get '/404'

      document = Nokogiri::HTML.parse(response.body)
      expect(document.css('.bp6-input-group.bp6-round')).to be_present
      expect(document.css('input.bp6-input')).to be_present
      expect(document.css('.bp6-input-action')).to be_present
      expect(document.css('button.bp6-button.bp6-minimal')).to be_present
    end

    it 'renders error-page actions with static Blueprint 6 classes' do
      get '/403'

      document = Nokogiri::HTML.parse(response.body)
      expect(document.css('a.bp6-button.bp6-intent-primary')).to be_present
    end
  end

  describe 'redirects' do
    {
      '/read/1071' => '/cases/mi-wolves/translations/fr',
      '/read/862' => '/cases/indonesia-conservation',
      '/read/611' => '/cases/ethiopia-napa',
      '/read/497' => '/cases/mi-wolves'
    }.each do |path, destination|
      it "preserves #{path} legacy redirect" do
        get path

        expect(response).to redirect_to(destination)
      end
    end

    it 'removes locale prefixes while preserving path and format' do
      get '/en/catalog/libraries.json'

      expect(response).to redirect_to('/catalog/libraries.json')
    end

    it 'removes locale prefixes while preserving path' do
      get '/en/catalog/libraries'

      expect(response).to redirect_to('/catalog/libraries')
    end
  end

  it 'keeps runtime stats protected from unauthenticated readers' do
    get '/runtime/stats'

    expect(response).to have_http_status(:unauthorized)
    expect(response.media_type).to eq 'application/json'
    expect(response.parsed_body).to include(
      'error' => 'You need to sign in or sign up before continuing.'
    )
  end
end
