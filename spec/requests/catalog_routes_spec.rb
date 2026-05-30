# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Catalog routes', type: :request do
  def expect_public_catalog_cache
    expect(response.headers['Cache-Control'])
      .to include('public', 'max-age=300', 's-maxage=300')
    expect(response.headers['Vary'])
      .to include('Accept', 'Accept-Language', 'Accept-Encoding')
    expect(response.headers['Set-Cookie']).to be_blank
  end

  it 'renders the catalog shell at root with the catalog pack mount' do
    get '/'

    expect(response).to have_http_status(:ok)

    document = Nokogiri::HTML.parse(response.body)
    expect(document.css('#catalog-app')).to be_present
    expect(response.body).to include('catalog')
  end

  it 'does not preload signed-in catalog data for anonymous readers' do
    get '/'

    document = Nokogiri::HTML.parse(response.body)
    preloads = document.css('link[rel="preload"][as="fetch"]').map { |node| node['href'] }

    expect(preloads).to include('/cases.json', '/cases/features.json', '/tags.json', '/catalog/libraries.json')
    expect(preloads).not_to include('/profile.json', '/enrollments.json')
  end

  it 'routes catalog React Router paths back to the catalog shell' do
    get '/catalog/search'

    expect(response).to have_http_status(:ok)
    expect(Nokogiri::HTML.parse(response.body).css('#catalog-app')).to be_present
  end

  it 'returns catalog libraries as JSON' do
    create(:library, visible_in_catalog: true)

    get '/catalog/libraries.json'

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq 'application/json'
    expect(response.parsed_body).to be_an(Array)
    expect_public_catalog_cache
  end

  it 'returns catalog case previews as cacheable JSON for anonymous readers' do
    create(:case, :published)

    get '/cases.json'

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq 'application/json'
    expect(response.parsed_body).to be_an(Array)
    expect_public_catalog_cache
  end

  it 'keeps signed-in case previews private' do
    sign_in create(:reader)

    get '/cases.json'

    expect(response).to have_http_status(:ok)
    expect(response.headers['Cache-Control']).not_to include('public')
  end

  it 'keeps cookie-bearing case previews private' do
    create(:case, :published)

    get '/cases.json', headers: { 'Cookie' => 'gala_anonymous_session=1' }

    expect(response).to have_http_status(:ok)
    expect(response.headers['Cache-Control']).not_to include('public')
  end

  it 'returns featured cases as cacheable JSON for anonymous readers' do
    create(:case, :published, featured: true)

    get '/cases/features.json'

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq 'application/json'
    expect(response.parsed_body).to include('features')
    expect_public_catalog_cache
  end

  it 'returns catalog languages as JSON' do
    get '/catalog/languages.json'

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq 'application/json'
    expect(response.parsed_body).to be_an(Array)
  end

  it 'returns tags as JSON' do
    get '/tags.json'

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq 'application/json'
    expect(response.parsed_body).to be_an(Array)
    expect_public_catalog_cache
  end

  it 'returns search results as JSON' do
    get '/search.json'

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq 'application/json'
    expect(response.parsed_body).to be_an(Array)
  end

  it 'accepts catalog search query arrays from the React Router search form' do
    get '/search.json', params: { q: ['zzzz-no-results'] }

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq 'application/json'
    expect(response.parsed_body).to eq([])
  end
end
