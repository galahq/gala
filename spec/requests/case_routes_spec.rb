# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Case routes', type: :request do
  it 'returns the case show shell with cache headers' do
    kase = create(:case, :published)

    get case_path(kase)

    expect(response).to have_http_status(:ok)
    expect(response.headers['Cache-Control']).to include('public', 'max-age=0', 's-maxage=')
    expect(response.headers['Vary']).to include('Accept', 'Accept-Language', 'Accept-Encoding')
    expect(response.headers['ETag']).to be_present
    expect(response.headers['Last-Modified']).to be_present
    expect(response.headers['Set-Cookie']).to be_blank
  end

  it 'returns 304 for unchanged case pages with matching ETag' do
    kase = create(:case, :published)

    get case_path(kase)
    etag = response.headers['ETag']

    get case_path(kase), headers: { 'If-None-Match' => etag }

    expect(response).to have_http_status(:not_modified)
  end

  it 'does not reuse case page ETags across response formats' do
    kase = create(:case, :published)

    get case_path(kase)
    html_etag = response.headers['ETag']

    get case_path(kase, format: :json), headers: { 'If-None-Match' => html_etag }

    expect(response).to have_http_status(:ok)
    expect(response.headers['ETag']).not_to eq(html_etag)
    expect(response.media_type).to eq 'application/json'
    expect(response.parsed_body['slug']).to eq(kase.slug)
  end

  it 'returns 304 for unchanged case pages with matching Last-Modified' do
    kase = create(:case, :published)

    get case_path(kase)
    last_modified = response.headers['Last-Modified']

    get case_path(kase), headers: { 'If-Modified-Since' => last_modified }

    expect(response).to have_http_status(:not_modified)
  end

  it 'returns the case show json payload with cache headers' do
    kase = create(:case, :published)

    get case_path(kase, format: :json)

    expect(response).to have_http_status(:ok)
    expect(response.headers['Cache-Control']).to include('public', 'max-age=0', 's-maxage=')
    expect(response.headers['ETag']).to be_present
    expect(response.headers['Last-Modified']).to be_present
    expect(response.media_type).to eq 'application/json'
    expect(response.parsed_body['slug']).to eq(kase.slug)
    expect(response.headers['Set-Cookie']).to be_blank
  end

  it 'returns 304 for unchanged case json with matching ETag' do
    kase = create(:case, :published)

    get case_path(kase, format: :json)
    etag = response.headers['ETag']

    get case_path(kase, format: :json), headers: { 'If-None-Match' => etag }

    expect(response).to have_http_status(:not_modified)
  end

  it 'updates cache path when a reader gains case editorship' do
    kase = create(:case, :published)
    reader = create(:reader)

    sign_in reader

    get case_path(kase, format: :json)
    original_etag = response.headers['ETag']

    expect(response.parsed_body['reader']['canUpdateCase']).to be(false)

    Editorship.create!(case: kase, editor: reader)

    get case_path(kase, format: :json), headers: { 'If-None-Match' => original_etag }

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body['reader']['canUpdateCase']).to be(true)
  end

  it 'updates cache path when a reader gains library management access' do
    kase = create(:case, :published)
    reader = create(:reader)

    sign_in reader

    get case_path(kase, format: :json)
    original_etag = response.headers['ETag']

    expect(response.parsed_body['reader']['canUpdateCase']).to be(false)

    create(:managership, manager: reader, library: kase.library)

    get case_path(kase, format: :json), headers: { 'If-None-Match' => original_etag }

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body['reader']['canUpdateCase']).to be(true)
  end

  it 'updates cache path when reader persona changes' do
    kase = create(:case, :published)
    reader = create(:reader)

    sign_in reader
    get case_path(kase, format: :json)
    original_etag = response.headers['ETag']

    reader.update!(persona: :teacher)
    reader.reload

    get case_path(kase, format: :json), headers: { 'If-None-Match' => original_etag }

    expect(response).to have_http_status(:ok)
  end

  it 'updates cache path when reader gains editor role' do
    kase = create(:case, :published)
    reader = create(:reader)

    sign_in reader
    get case_path(kase, format: :json)
    original_etag = response.headers['ETag']

    expect(response.parsed_body['reader']['canUpdateCase']).to be(false)

    reader.add_role(:editor)
    reader.reload

    get case_path(kase, format: :json), headers: { 'If-None-Match' => original_etag }

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body['reader']['canUpdateCase']).to be(true)
  end

  it 'does not share cached case json between different signed-in readers' do
    kase = create(:case, :published)
    reader_a = create(:reader)
    reader_b = create(:reader)

    sign_in reader_a
    get case_path(kase, format: :json)
    reader_a_etag = response.headers['ETag']

    expect(response.parsed_body['reader']['id']).to eq(reader_a.id)

    sign_in reader_b
    get case_path(kase, format: :json)

    expect(response.parsed_body['reader']['id']).to eq(reader_b.id)

    get case_path(kase, format: :json), headers: { 'If-None-Match' => reader_a_etag }

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body['reader']['id']).to eq(reader_b.id)
  end

  it 'never caches signed-in case pages' do
    kase = create(:case, :published)
    sign_in create(:reader)

    get case_path(kase)

    expect(response).to have_http_status(:ok)
    expect(response.headers['Cache-Control']).to eq('no-store')
  end

  it 'never caches signed-in case json' do
    kase = create(:case, :published)
    sign_in create(:reader)

    get case_path(kase, format: :json)

    expect(response).to have_http_status(:ok)
    expect(response.headers['Cache-Control']).to eq('no-store')
  end

  it 'reuses the signed-in case json ETag across sessions for the same reader' do
    # The JSON payload contains no session-bound state (no CSRF token), so the
    # cache fragment and ETag are deliberately session-independent — otherwise
    # every new session writes a fresh, never-reused entry to Redis.
    kase = create(:case, :published)
    reader = create(:reader)

    sign_in reader
    get case_path(kase, format: :json)
    first_etag = response.headers['ETag']

    sign_out reader
    sign_in reader
    get case_path(kase, format: :json)

    expect(response).to have_http_status(:ok)
    expect(response.headers['ETag']).to eq(first_etag)
  end

  it 'changes the signed-in case html ETag across sessions for the same reader' do
    kase = create(:case, :published)
    reader = create(:reader)

    sign_in reader
    get case_path(kase)
    first_etag = response.headers['ETag']

    sign_out reader
    sign_in reader
    get case_path(kase)

    expect(response).to have_http_status(:ok)
    expect(response.headers['ETag']).not_to eq(first_etag)
  end

  it 'does not cache quiz index through the show allowlist path' do
    kase = create(:case, :published)
    sign_in create(:reader, :editor)

    get "/cases/#{kase.slug}/quizzes"

    expect(response).to have_http_status(:ok)
    cache_control = response.headers['Cache-Control']
    expect(cache_control.nil? || !cache_control.include?('s-maxage=')).to be(true)
  end

  it 'does not cache confirm deletion page through the allowlist path' do
    kase = create(:case)
    sign_in create(:reader, :editor)

    get "/cases/#{kase.slug}/confirm_deletion"

    expect(response).to have_http_status(:ok)
    cache_control = response.headers['Cache-Control']
    expect(cache_control.nil? || !cache_control.include?('s-maxage=')).to be(true)
  end

  it 'does not cache editorships new page through the allowlist path' do
    kase = create(:case)
    sign_in create(:reader, :editor)

    get "/cases/#{kase.slug}/editorships/new"

    expect(response).to have_http_status(:ok)
    cache_control = response.headers['Cache-Control']
    expect(cache_control.nil? || !cache_control.include?('s-maxage=')).to be(true)
  end
end
