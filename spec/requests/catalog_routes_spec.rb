# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Catalog routes', type: :request do
  # rubocop:disable Metrics/AbcSize
  def expect_public_catalog_cache
    expect(response.headers['Cache-Control'])
      .to include('public', 'max-age=0', 's-maxage=')
    expect(response.headers['Vary'])
      .to include('Accept', 'Accept-Language', 'Accept-Encoding')
    expect(response.headers['Set-Cookie']).to be_blank
  end
  # rubocop:enable Metrics/AbcSize

  it 'renders the catalog shell at root with the catalog pack mount' do
    get '/'

    expect(response).to have_http_status(:ok)

    document = Nokogiri::HTML.parse(response.body)
    expect(document.css('#catalog-app')).to be_present
    expect(response.body).to include('catalog')
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

  it 'returns 304 for the unchanged anonymous home with matching ETag' do
    create(:case, :published)

    get '/'
    etag = response.headers['ETag']

    get '/', headers: { 'If-None-Match' => etag }

    expect(response).to have_http_status(:not_modified)
  end

  it 'never caches the signed-in home page' do
    sign_in create(:reader)

    get '/'

    expect(response).to have_http_status(:ok)
    expect(response.headers['Cache-Control']).to eq('no-store')
  end

  it 'does not serve a 304 to a signed-in reader revalidating a previously cached home page' do
    create(:case, :published)

    get '/'
    anonymous_etag = response.headers['ETag']

    sign_in create(:reader)
    get '/', headers: { 'If-None-Match' => anonymous_etag }

    expect(response).to have_http_status(:ok)
    expect(response.headers['Cache-Control']).to eq('no-store')
    expect(response.body).to include('window.reader')
  end

  it 'serves the logged-out home page after sign out, never a stale signed-in one' do
    create(:case, :published)
    reader = create(:reader)

    sign_in reader
    get '/'
    expect(response.headers['Cache-Control']).to eq('no-store')
    expect(response.body).to include(reader.email)
    expect(response.body).not_to match(/window\.reader\s*=\s*undefined/)

    sign_out reader
    get '/'

    expect(response).to have_http_status(:ok)
    expect(response.body).not_to include(reader.email)
    expect(response.body).to match(/window\.reader\s*=\s*undefined/)
    expect(response.headers['Cache-Control'])
      .to include('public', 'max-age=0', 's-maxage=')
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
    expect(response.headers['Cache-Control']).to eq('no-store')
    expect(response.body).to be_present
  end

  it 'allows cacheable catalog previews for anonymous cookie-bearing readers' do
    create(:case, :published)

    get '/cases.json', headers: { 'Cookie' => 'gala_anonymous_session=1' }

    expect(response).to have_http_status(:ok)
    expect(response.headers['Cache-Control']).to include('public', 's-maxage=86400', 'max-age=0')
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
