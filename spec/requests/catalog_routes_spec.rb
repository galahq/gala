# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Catalog routes', type: :request do
  it 'renders the catalog shell at root with the catalog pack mount' do
    get '/'

    expect(response).to have_http_status(:ok)

    document = Nokogiri::HTML.parse(response.body)
    expect(document.css('#catalog-app')).to be_present
    expect(response.body).to include('catalog')
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
