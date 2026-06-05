# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'ActiveStorage CORS behavior' do
  it 'returns CORS headers on preflight OPTIONS requests' do
    options '/rails/active_storage/direct_uploads',
            headers: {
              'HTTP_ORIGIN' => 'https://ci-smoke.dev.learngala.dev',
              'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
              'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'content-type, x-csrf-token'
            }

    expect(response).to have_http_status(:no_content)
    expect(response.headers['Access-Control-Allow-Origin']).to eq(
      'https://ci-smoke.dev.learngala.dev'
    )
    expect(response.headers['Access-Control-Allow-Methods']).to include('POST')
    expect(response.headers['Access-Control-Allow-Headers']).to include('content-type')
  end
end
