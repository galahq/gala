# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Health check' do
  it 'returns ok without authentication' do
    get '/up'

    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq 'text/plain'
    expect(response.body).to eq 'OK'
  end
end
