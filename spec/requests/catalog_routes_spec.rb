# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Catalog routes', type: :request do
  # rubocop:disable Metrics/AbcSize
  def expect_public_catalog_cache
    expect(response.headers['Cache-Control'])
      .to include('public', 'no-cache', 'stale-while-revalidate=')
    expect(response.headers['Vary'])
      .to include('Accept', 'Accept-Language', 'Accept-Encoding', 'Cookie')
    expect(response.headers['Set-Cookie']).to be_blank
  end
  # rubocop:enable Metrics/AbcSize

  def expect_private_catalog_cache
    expect(response.headers['Cache-Control'])
      .to include('private', 'no-store')
    expect(response.headers['Cache-Control']).not_to include('public', 's-maxage')
    expect(response.headers['Vary'])
      .to include('Accept', 'Accept-Language', 'Accept-Encoding', 'Cookie')
  end

  it 'renders the catalog shell at root with the catalog pack mount' do
    get '/'

    expect(response).to have_http_status(:ok)

    document = Nokogiri::HTML.parse(response.body)
    expect(document.css('#catalog-app')).to be_present
    expect(response.body).to include('catalog')
    expect(response.headers['Cache-Control'])
      .to include('private', 'no-store')
    expect(response.headers['Vary']).to include('Cookie')
  end

  it 'changes the root ETag when the visible case set changes with the same timestamp and count' do
    timestamp = Time.zone.parse('2025-01-01 12:00:00 UTC')
    replaced_case = create(:case, :published, published_at: timestamp, updated_at: timestamp)
    create(:case, :published, published_at: timestamp, updated_at: timestamp)

    get '/'
    original_etag = response.headers['ETag']

    replaced_case.update_columns(published_at: nil, updated_at: timestamp)
    create(:case, :published, published_at: timestamp, updated_at: timestamp)

    get '/', headers: { 'If-None-Match' => original_etag }

    expect(response).to have_http_status(:ok)
    expect(response.headers['ETag']).not_to eq(original_etag)
  end

  it 'does not preload signed-in catalog data for anonymous readers' do
    get '/'

    document = Nokogiri::HTML.parse(response.body)
    preloads = document.css('link[rel="preload"][as="fetch"]').map { |node| node['href'] }

    expect(preloads).to include('/cases.json', '/cases/features.json', '/tags.json', '/catalog/libraries.json')
    expect(preloads).not_to include('/profile.json', '/enrollments.json')
  end

  it 'renders signed-in catalog data with private cache headers' do
    reader = create(:reader)
    sign_in reader

    get '/'

    expect(response).to have_http_status(:ok)
    expect_private_catalog_cache
    expect(response.body).to include('window.reader', reader.email)

    document = Nokogiri::HTML.parse(response.body)
    preloads = document.css('link[rel="preload"][as="fetch"]').map { |node| node['href'] }
    expect(preloads).to include('/profile.json', '/enrollments.json')
  end

  it 'always includes CSRF meta tags on catalog routes' do
    reader = create(:reader)
    sign_in reader

    get '/'

    expect(response.body).to include('name="csrf-param"')
    expect(response.body).to include('name="csrf-token"')
  end

  it 'forces spotlight acknowledgements when launching with the onboarding query' do
    reader = create(:reader, persona: :teacher, sign_in_count: 1)
    create :spotlight_acknowledgement, reader: reader, spotlight_key: 'catalog_search'
    sign_in reader

    get '/?show_spotlight_acknowledgements=true'

    document = Nokogiri::HTML.parse(response.body)
    script = document.css('script').find { |node| node.text.include?('window.reader') }
    reader_json = script&.text&.match(/window\.reader\s*=\s*(\{[\s\S]*?\});/m)&.[](1)

    expect(script).to be_present
    expect(reader_json).to be_present
    expect(JSON.parse(reader_json)['unacknowledgedSpotlights']).to include('catalog_search')
  end

  it 'does not reuse the anonymous root ETag after a reader signs in' do
    get '/'
    anonymous_etag = response.headers['ETag']

    sign_in create(:reader)
    get '/', headers: { 'If-None-Match' => anonymous_etag }

    expect(response).to have_http_status(:ok)
    expect(response.headers['ETag']).not_to eq(anonymous_etag)
    expect(response.body).to include('window.reader')
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
    expect_private_catalog_cache
    expect(response.body).to be_present
  end

  it 'allows cacheable catalog previews for anonymous cookie-bearing readers' do
    create(:case, :published)

    get '/cases.json', headers: { 'Cookie' => 'gala_anonymous_session=1' }

    expect(response).to have_http_status(:ok)
    expect(response.headers['Cache-Control']).to include('public', 's-maxage=2592000', 'no-cache')
    expect(response.body).to be_present
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
