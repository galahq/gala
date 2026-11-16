# frozen_string_literal: true

require 'rails_helper'

# The Ahoy::Store spec hands track_visit an ip: of its own, which would keep
# passing if the real request path ever stopped supplying one. This covers
# the path a browser actually takes, where the address comes from
# request.remote_ip and Ahoy masks it before anything reads it.
RSpec.describe 'Recording a visit' do
  before { host! 'test.host' }

  def track(remote_addr)
    post '/ahoy/visits',
         params: { visit_token: SecureRandom.uuid, visitor_token: SecureRandom.uuid }.to_json,
         headers: { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => remote_addr }
    Visit.order(:id).last
  end

  it 'stores the masked address and the country it resolves to' do
    visit = track('8.8.8.8')

    expect(response).to have_http_status(:success)
    expect(visit.ip).to eq '8.8.8.0'
    expect(visit.country).to eq 'US'
  end

  it 'records no country for an address the database does not cover' do
    expect(track('10.1.2.3').country).to be_nil
  end
end
