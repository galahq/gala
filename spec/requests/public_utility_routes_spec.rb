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
      it "renders #{path} with static Blueprint 4 compatibility classes" do
        get path

        expect(response).to have_http_status(status)

        document = Nokogiri::HTML.parse(response.body)
        expect(document.css('.pt-non-ideal-state.bp4-non-ideal-state')).to be_present
        expect(document.css('.pt-non-ideal-state-title.bp4-non-ideal-state-title')).to be_present
        expect(document.css('.pt-non-ideal-state-description.bp4-non-ideal-state-description')).to be_present
      end
    end

    it 'renders the 404 search form with static Blueprint 4 compatibility classes' do
      get '/404'

      document = Nokogiri::HTML.parse(response.body)
      expect(document.css('.pt-input-group.bp4-input-group.pt-round.bp4-round')).to be_present
      expect(document.css('input.pt-input.bp4-input')).to be_present
      expect(document.css('.pt-input-action.bp4-input-action')).to be_present
      expect(document.css('button.pt-button.bp4-button.pt-minimal.bp4-minimal')).to be_present
    end

    it 'renders error-page actions with static Blueprint 4 compatibility classes' do
      get '/403'

      document = Nokogiri::HTML.parse(response.body)
      expect(document.css('a.pt-button.bp4-button.pt-intent-primary.bp4-intent-primary')).to be_present
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

end
